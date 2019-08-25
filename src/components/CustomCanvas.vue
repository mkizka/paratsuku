<template>
  <div>
    <button @click="undo">undo</button>
    <button @click="toggle">toggle</button>
    <button @click="clear">clear</button>
    <div id="customCanvasContainer"></div>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Watch } from 'vue-property-decorator';
import Konva from 'konva';

enum PaintMode {
  brush,
  eraser,
}

@Component
export default class CustomCanvas extends Vue {
  private lines: Array<Konva.Line> = [];
  private stage: Konva.Stage | undefined;
  private isPaint: Boolean = false;
  private mode: PaintMode = PaintMode.brush;

  undo() {
    this.lines = this.lines.slice(0, -1);
  }

  toggle() {
    this.mode = this.mode === PaintMode.brush ? PaintMode.eraser : PaintMode.brush;
  }

  clear() {
    this.lines = [];
  }

  get layer(): Konva.Layer {
    return this.stage!.getLayers()[0] as Konva.Layer;
  }

  @Watch('lines')
  paint() {
    this.layer.removeChildren();
    this.lines.forEach((line: Konva.Line) => {
      this.layer.add(line);
    });
    this.layer.batchDraw();
  }

  mounted() {
    this.stage = new Konva.Stage({
      container: 'customCanvasContainer',
      width: window.innerWidth,
      height: window.innerHeight
    });

    const layer = new Konva.Layer();
    this.stage.add(layer);

    this.stage.on('mousedown touchstart', () => {
      this.isPaint = true;
      const pos = this.stage!.getPointerPosition();
      this.lines.push(
        new Konva.Line({
          stroke: '#df4b26',
          strokeWidth: 5,
          globalCompositeOperation:
            this.mode === PaintMode.brush ? 'source-over' : 'destination-out',
          points: [pos.x, pos.y]
        } as Konva.LineConfig)
      );
    });

    this.stage.on('mousemove touchmove', () => {
      if (!this.isPaint) return;

      const pos = this.stage!.getPointerPosition();
      const lastLine = this.lines.pop();
      let newPoints = lastLine!.points().concat([pos.x, pos.y]);
      lastLine!.points(newPoints);

      this.lines.push(lastLine!);
    });

    this.stage.on('mouseup touchend', () => {
      this.isPaint = false;
    });
  }
}
</script>
