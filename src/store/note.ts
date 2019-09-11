import Vue from 'vue';
import Konva from 'konva';

import { penInstance } from './pen';

export class Note {
  public pages: Array<Page> = [new Page()];
  public pageIndex: number = 0;
  public fps: number = 12;
  public onionRange: 0 | 1 | 2 | 3 = 2;
  public apiUrl: string = process.env.VUE_APP_API_URL || 'https://tsukuriga.net/para';
  public shouldRepaint: boolean = false;

  public relativePage(relativeIndex: number): Page {
    return this.pages[this.pageIndex + relativeIndex];
  }

  public get currentPage(): Page {
    return this.relativePage(0);
  }

  public get pageStateDisplay() {
    return `${this.pageIndex + 1}/${this.pages.length}`;
  }

  public pushPage(isLoop: boolean = false): void {
    this.currentPage.endLine();
    this.pageIndex++;
    if (this.pageIndex >= this.pages.length) {
      if (isLoop) {
        this.pageIndex = 0;
      } else {
        this.pages.push(new Page());
      }
    }
    this.shouldRepaint = true;
  }

  public backPage(): void {
    this.currentPage.endLine();
    if (this.pageIndex > 0) this.pageIndex--;
    this.shouldRepaint = true;
  }

  public flipPage(toIndex: number): void {
    if (0 <= toIndex && toIndex <= this.pages.length - 1) {
      this.pageIndex = toIndex;
      this.shouldRepaint = true;
    }
  }

  public deletePage(): void {
    if (this.pages.length >= 1) {
      this.pages.splice(this.pageIndex, 1);
      if (this.pageIndex > this.pages.length - 1) {
        this.pageIndex = this.pages.length - 1;
      }
      this.shouldRepaint = true;
    }
  }

  public insertPage(): void {
    this.pages.splice(this.pageIndex, 0, new Page());
  }

  public copyPage(): void {
    this.pages.splice(this.pageIndex, 0, this.currentPage.clone());
  }

  public exchangePage(relativeIndex: number): void {
    [this.pages[this.pageIndex], this.pages[this.pageIndex + relativeIndex]] =
      [this.pages[this.pageIndex + relativeIndex], this.pages[this.pageIndex]];
    this.pageIndex += relativeIndex;
    this.shouldRepaint = true;
  }
}

export class Page {
  public lines: Array<Line> = [];
  public redoableLines: Array<Line> = [];

  public clone(): Page {
    const clonedPage = new Page();
    clonedPage.lines = this.lines.map(l => l.clone());
    clonedPage.redoableLines = this.redoableLines.map(l => l.clone());
    return clonedPage;
  }

  public get latestLine() {
    return this.lines[this.lines.length - 1];
  }

  public addLine(pos: { x: number, y: number }): void {
    this.lines.push(
      new Line({
        stroke: penInstance.palette.color,
        strokeWidth: penInstance.width,
        lineCap: 'round',
        lineJoin: 'round',
        globalCompositeOperation: penInstance.type,
        points: [pos.x, pos.y]
      } as Konva.LineConfig)
    );
    this.redoableLines = [];
  }

  public updateLine(pos: { x: number, y: number }): void {
    if (this.lines.length === 0 || this.latestLine.isFinished) {
      this.addLine(pos);
    } else {
      const lastLine = this.lines.pop();
      let newPoints = lastLine!.points().concat([pos.x, pos.y]);
      lastLine!.points(newPoints);
      this.lines.push(lastLine!);
    }
  }

  public endLine() {
    if (this.lines.length > 0) {
      this.latestLine.isFinished = true;
    }
  }

  public undo(): void {
    if (this.lines.length > 0) {
      const removedLatest = this.lines.pop();
      this.redoableLines.push(removedLatest!);
    }
    noteInstance.shouldRepaint = true;
  }

  public redo(): void {
    if (this.redoableLines.length > 0) {
      const redoablLatest = this.redoableLines.pop();
      this.lines.push(redoablLatest!);
    }
    noteInstance.shouldRepaint = true;
  }
}

export class Line extends Konva.Line {
  public isFinished = false;

  clone(obj?: any): Line {
    const clonedObj: Line = super.clone(obj);
    clonedObj.isFinished = this.isFinished;
    return clonedObj;
  }
}

export const noteInstance = Vue.observable(new Note());
