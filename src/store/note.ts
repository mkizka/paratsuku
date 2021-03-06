import Vue from 'vue';
import Konva from 'konva';
import Color from 'color';

import { penInstance } from './pen';

export class Note {
  public pages: Array<Page> = [new Page()];
  public pageIndex: number = 0;
  public fps: number = 12;
  public onionRange: 0 | 1 | 2 | 3 = 2;
  public isCopyMode: boolean = false;
  public isPlaying: boolean = false;
  public apiUrl: string = process.env.VUE_APP_API_URL || 'https://tsukuriga.net/para';

  private stage: Konva.Stage | undefined;
  private playInterval: number | undefined = undefined;

  initStage(container: string) {
    this.stage = new Konva.Stage({
      container: container,
      width: window.innerWidth,
      height: window.innerHeight,
    });

    const layer = new Konva.Layer();
    this.stage.add(layer);
    const onionLayer = new Konva.Layer();
    this.stage.add(onionLayer);
    const backgroundLayer = new Konva.Layer();
    this.stage.add(backgroundLayer);

    window.addEventListener('mousemove', (e) => {
      if (e.clientX < 0 || this.stage!.width() < e.clientX
        || e.clientY < 0 || this.stage!.height() < e.clientY) this.currentPage.endLine();
    });

    window.addEventListener('resize', (e) => {
      this.stage!.width(window.innerWidth);
      this.stage!.height(window.innerHeight);
      this.paintBackground();
    });

    this.stage.on('mousedown touchstart', (e: { evt: MouseEvent | TouchEvent }) => {
      if (e.evt instanceof TouchEvent && e.evt.touches.length > 1) return;
      if (e.evt instanceof MouseEvent && e.evt.buttons !== 1) return;

      const pos = this.stage!.getPointerPosition();
      this.currentPage.addLine(pos);
      this.paint();
    });

    this.stage.on('mousemove touchmove', (e: { evt: MouseEvent | TouchEvent }) => {
      if (e.evt instanceof MouseEvent && e.evt.buttons !== 1) return;
      e.evt.preventDefault();

      const pos = this.stage!.getPointerPosition();
      this.currentPage.updateLine(pos);
      this.paint();
    });

    this.stage.on('mouseup touchend', (e: { evt: MouseEvent | TouchEvent }) => {
      if (e.evt instanceof TouchEvent && e.evt.touches.length > 0) return;

      this.currentPage.endLine();
      this.paint();
    });

    this.paintBackground();
  }

  private paint(): void {
    const children = this.currentLayer.getChildren();
    const latestLinePainted = children[children.length - 1] as Line;

    // 最新のLineが途中であれば、それのみ差し替えて描画することで処理を軽減する
    if (latestLinePainted && !latestLinePainted.isFinished) {
      latestLinePainted.remove();
    }
    if (this.currentPage.lines.length > 0) {
      this.currentLayer.add(this.currentPage.latestLine);
    }

    this.currentLayer.batchDraw();
  }

  public repaintAll(): void {
    this.currentLayer.removeChildren();

    this.currentPage.lines.forEach((line: Konva.Line) => {
      this.currentLayer.add(line);
    });

    this.paintOnion();
    this.currentLayer.batchDraw();
  }

  private paintOnion(): void {
    if (this.isPlaying) return;
    this.onionLayer.removeChildren();

    // [0, 1, ... onionRange-1]
    const onionIndexList: number[] = [...Array(this.onionRange).keys()];
    const onionMixRateList: number[] = [0.5, 0.7, 0.8];

    // より前のページから描画していくため反転
    onionIndexList.reverse().forEach((onionIndex: number) => {
      const onionRelativeIndex = -(onionIndex + 1);
      if (this.pageIndex + onionRelativeIndex < 0) return;

      this.relativePage(onionRelativeIndex).lines.forEach((line: Line) => {
        const strokeColor = new Color(line.stroke());
        const onionLine: Line = line.clone({
          stroke: strokeColor.mix(
            new Color(penInstance.palette.backgroundColor), onionMixRateList[onionIndex]
          ).string()
        });
        this.onionLayer.add(onionLine);
      });
    });

    this.onionLayer.batchDraw();
  }

  public paintBackground(): void {
    const backgroundRect = new Konva.Rect({
      x: 0,
      y: 0,
      width: this.stage!.width(),
      height: this.stage!.height(),
      fill: penInstance.palette.backgroundColor
    } as Konva.RectConfig);
    this.backgroundLayer.add(backgroundRect);
    this.backgroundLayer.batchDraw();
  }

  public relativePage(relativeIndex: number): Page {
    return this.pages[this.pageIndex + relativeIndex];
  }

  public get currentPage(): Page {
    return this.relativePage(0);
  }

  public get currentLayer(): Konva.Layer {
    return this.stage!.getLayers()[2] as Konva.Layer;
  }

  public get onionLayer(): Konva.Layer {
    return this.stage!.getLayers()[1] as Konva.Layer;
  }

  private get backgroundLayer(): Konva.Layer {
    return this.stage!.getLayers()[0] as Konva.Layer;
  }

  public get pageStateDisplay() {
    return `${this.pageIndex + 1}/${this.pages.length}`;
  }

  public play(): void {
    if (!this.isPlaying) {
      this.onionLayer.hide();
      this.playInterval = setInterval(() => {
        this.pushPage(true);
      }, 1000 / this.fps);
    } else {
      this.onionLayer.show();
      clearInterval(this.playInterval);
      this.playInterval = undefined;
    }
    this.isPlaying = !this.isPlaying;
  }

  public pushPage(isLoop: boolean = false): void {
    this.currentPage.endLine();
    this.pageIndex++;
    if (this.pageIndex >= this.pages.length) {
      if (isLoop) {
        this.pageIndex = 0;
      } else if (this.isCopyMode) {
        this.pages.push(this.relativePage(-1).clone());
      } else {
        this.pages.push(new Page());
      }
    }
    this.repaintAll();
  }

  public backPage(): void {
    this.currentPage.endLine();
    if (this.pageIndex > 0) this.pageIndex--;
    this.repaintAll();
  }

  public flipPage(toIndex: number): void {
    if (0 <= toIndex && toIndex <= this.pages.length - 1) {
      this.pageIndex = toIndex;
      this.repaintAll();
    }
  }

  public deletePage(): void {
    if (this.pages.length >= 1) {
      this.pages.splice(this.pageIndex, 1);
      if (this.pageIndex > this.pages.length - 1) {
        this.pageIndex = this.pages.length - 1;
      }
      this.repaintAll();
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
    this.repaintAll();
  }

  public toDataUrl(pageIndex: number): string {
    this.pageIndex = pageIndex;
    this.repaintAll();

    this.onionLayer.hide();
    const dataUrl: string = this.stage!.toDataURL();
    this.onionLayer.show();

    return dataUrl;
  }

  public toDataUrlArray(): string[] {
    const currentPageIndex = this.pageIndex;
    let data = [];
    this.flipPage(0);

    this.onionLayer.hide();
    for (let i = 0; i < this.pages.length; i++) {
      const currentPageDataUrl = this.stage!.toDataURL();
      data.push(currentPageDataUrl);
      this.pushPage(true);
    }
    this.onionLayer.show();

    this.flipPage(currentPageIndex);
    return data;
  }

  public async toDataUrlGif(): Promise<string> {
    let data = this.toDataUrlArray().map((dataUrl: string) => {
      return dataUrl.split(';base64,')[1];
    });

    const form = new FormData();
    form.append('fps', this.fps.toString());
    form.append('text', data.join('@'));

    const response = await fetch(
      noteInstance.apiUrl + '/encode',
      {method: 'POST', body: form, mode: 'cors', credentials: 'include'},
    );
    const json: { base64: string } = await response.json();
    return json.base64;
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
    noteInstance.repaintAll();
  }

  public redo(): void {
    if (this.redoableLines.length > 0) {
      const redoablLatest = this.redoableLines.pop();
      this.lines.push(redoablLatest!);
    }
    noteInstance.repaintAll();
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
