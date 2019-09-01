import Vue from 'vue';
import Konva from 'konva';
import { Pen, penInstance } from './pen';

export class Note {
  public stage: Konva.Stage | undefined;
  public pages: Array<Page> = [new Page()];
  public pageIndex: number = 0;
  private isPaint: boolean = false;
  private pen: Pen = penInstance;

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
      this.isPaint = true;

      const pos = this.stage!.getPointerPosition();
      this.currentPage.addLine(pos);
      this.paint();
    });

    this.stage.on('mousemove touchmove', e => {
      if (!this.isPaint) return;
      e.evt.preventDefault();

      const pos = this.stage!.getPointerPosition();
      this.currentPage.updateLine(pos);
      this.paint();
    });

    this.stage.on('mouseup touchend', () => {
      this.isPaint = false;

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

  public pushPage(): void {
    this.pageIndex++;
    if (this.pageIndex >= this.pages.length) {
      this.pages.push(new Page());
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
