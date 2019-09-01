import Vue from 'vue';
import Konva from 'konva';
import { penInstance } from './pen';

export class Note {
  public stage: Konva.Stage | undefined;
  public pages: Array<Page> = [new Page()];
  public pageIndex: number = 0;
  public fps: number = 12;
  public isPlaying: boolean = false;
  private playInterval: number | undefined = undefined;

  initStage(stageConfig: Konva.ContainerConfig) {
    this.stage = new Konva.Stage({
      container: stageConfig.container,
      width: stageConfig.width,
      height: stageConfig.height,
    });

    const layer = new Konva.Layer();
    this.stage.add(layer);
    const onionLayer = new Konva.Layer();
    this.stage.add(onionLayer);

    this.stage.on('mousedown touchstart', () => {
      const pos = this.stage!.getPointerPosition();
      this.currentPage.addLine(pos);
      this.paint();
    });

    this.stage.on('mousemove touchmove', e => {
      if (e.evt.buttons !== 1) return;
      e.evt.preventDefault();

      const pos = this.stage!.getPointerPosition();
      this.currentPage.updateLine(pos);
      this.paint();
    });

    this.stage.on('mouseup touchend', () => {
      this.currentPage.endLine();
      this.paint();
    });
  }

  public paint(): void {
    const children = this.currentLayer.getChildren();
    const latestLinePainted = children[children.length - 1] as Line;

    // 最新のLineが途中であれば、それのみ差し替えて描画することで処理を軽減する
    if (latestLinePainted && !latestLinePainted.isFinished) {
      latestLinePainted.remove();
    }
    this.currentLayer.add(this.currentPage.latestLine);

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
    this.onionLayer.removeChildren();

    if (this.pageIndex > 0) {
      this.relativePage(-1).lines.forEach((line: Line) => {
        const onionLine: Line = line.clone({stroke: 'grey'});
        this.onionLayer.add(onionLine);
      });
    }

    this.onionLayer.batchDraw();
  }

  public relativePage(relativeIndex: number): Page {
    return this.pages[this.pageIndex + relativeIndex];
  }

  public get currentPage(): Page {
    return this.relativePage(0);
  }

  public get currentLayer(): Konva.Layer {
    return this.stage!.getLayers()[1] as Konva.Layer;
  }

  public get onionLayer(): Konva.Layer {
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
    this.pageIndex++;
    if (this.pageIndex >= this.pages.length) {
      if (isLoop) {
        this.pageIndex = 0;
      } else {
        this.pages.push(new Page());
      }
    }
    this.repaintAll();
  }

  public backPage(): void {
    if (this.pageIndex > 0) this.pageIndex--;
    this.repaintAll();
  }
}

export class Page {
  public lines: Array<Line> = [];
  public redoableLines: Array<Line> = [];

  public get latestLine() {
    return this.lines[this.lines.length - 1];
  }

  public addLine(pos: { x: number, y: number }): void {
    this.lines.push(
      new Line({
        stroke: penInstance.stroke,
        strokeWidth: penInstance.strokeWidth,
        globalCompositeOperation: penInstance.type,
        points: [pos.x, pos.y]
      } as Konva.LineConfig)
    );
  }

  public updateLine(pos: { x: number, y: number }): void {
    const lastLine = this.lines.pop();
    let newPoints = lastLine!.points().concat([pos.x, pos.y]);
    lastLine!.points(newPoints);
    this.lines.push(lastLine!);
  }

  public endLine() {
    this.latestLine.isFinished = true;
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
}

export const noteInstance = Vue.observable(new Note());
