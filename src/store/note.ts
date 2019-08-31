import Vue from 'vue';
import Konva from 'konva';

export class Note {
  public stage: Konva.Stage | undefined;
  public pages: Array<Page> = [new Page()];
  public pageIndex: number = 0;
  private isPaint = false;

  initStage(stageConfig: Konva.ContainerConfig) {
    this.stage = new Konva.Stage({
      container: stageConfig.container,
      width: stageConfig.width,
      height: stageConfig.height,
    });

    const layer = new Konva.Layer();
    this.stage.add(layer);

    this.stage.on('mousedown touchstart', () => {
      this.isPaint = true;
      const pos = this.stage!.getPointerPosition();

      this.currentPage.lines.push(
        new Konva.Line({
          stroke: '#df4b26',
          strokeWidth: 5,
          globalCompositeOperation: 'source-over',
          points: [pos.x, pos.y]
        } as Konva.LineConfig)
      );

      this.repaint();
    });

    this.stage.on('mousemove touchmove', () => {
      if (!this.isPaint) return;

      const pos = this.stage!.getPointerPosition();
      this.currentPage.addLine(pos);
      this.repaint();
    });

    this.stage.on('mouseup touchend', () => {
      this.isPaint = false;
      this.repaint();
    });
  }

  public repaint(): void {
    this.currentLayer.removeChildren();

    if (this.pageIndex > 0) {
      this.relativePage(-1).lines.forEach((line: Line) => {
        const onionLine: Line = line.clone({stroke: 'grey'});
        this.currentLayer.add(onionLine);
      });
    }

    this.currentPage.lines.forEach((line: Line) => {
      this.currentLayer.add(line);
    });

    this.currentLayer.batchDraw();
  }

  public relativePage(relativeIndex: number) {
    return this.pages[this.pageIndex + relativeIndex];
  }

  public get currentPage(): Page {
    return this.relativePage(0);
  }

  public get currentLayer(): Konva.Layer {
    return this.stage!.getLayers()[0] as Konva.Layer;
  }

  public pushPage(): void {
    this.pageIndex++;
    if (this.pageIndex >= this.pages.length) {
      this.pages.push(new Page());
    }
    this.repaint();
  }

  public backPage(): void {
    if (this.pageIndex > 0) this.pageIndex--;
    this.repaint();
  }
}

export class Page {
  public lines: Array<Line> = [];
  public redoableLines: Array<Line> = [];

  public addLine(pos: { x: number, y: number }): void {
    const lastLine = this.lines.pop();
    let newPoints = lastLine!.points().concat([pos.x, pos.y]);
    lastLine!.points(newPoints);
    this.lines.push(lastLine!);
  }

  public undo(): void {
  }

  public redo(): void {
  }
}

export class Line extends Konva.Line {
}

export const noteInstance = Vue.observable(new Note());
