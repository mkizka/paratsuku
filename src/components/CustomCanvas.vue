<template>
  <div id="CustomCanvas"></div>
</template>

<script lang="ts">
import { Component, Vue, Watch } from 'vue-property-decorator';
import { noteInstance, Note, Line } from '@/store/note';
import { penInstance } from '@/store/pen';

import Color from 'color';
import Konva from 'konva';

@Component
export default class CustomCanvas extends Vue {
  private note: Note = noteInstance;
  private isPlaying: boolean = false;
  private playInterval: number | undefined = undefined;
  private stage: Konva.Stage | undefined;

  mounted() {
    this.stage = new Konva.Stage({
      container: '#CustomCanvas',
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
        || e.clientY < 0 || this.stage!.height() < e.clientY) noteInstance.currentPage.endLine();
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
      noteInstance.currentPage.addLine(pos);
      this.paint();
    });

    this.stage.on('mousemove touchmove', (e: { evt: MouseEvent | TouchEvent }) => {
      if (e.evt instanceof MouseEvent && e.evt.buttons !== 1) return;
      e.evt.preventDefault();

      const pos = this.stage!.getPointerPosition();
      noteInstance.currentPage.updateLine(pos);
      this.paint();
    });

    this.stage.on('mouseup touchend', (e: { evt: MouseEvent | TouchEvent }) => {
      if (e.evt instanceof TouchEvent && e.evt.touches.length > 0) return;

      noteInstance.currentPage.endLine();
      this.paint();
    });

    this.paintBackground();
  }

  public play(): void {
    if (!this.isPlaying) {
      this.onionLayer.hide();
      this.playInterval = setInterval(() => {
        noteInstance.pushPage(true);
      }, 1000 / noteInstance.fps);
    } else {
      this.onionLayer.show();
      clearInterval(this.playInterval);
      this.playInterval = undefined;
    }
    this.isPlaying = !this.isPlaying;
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

  private paint(): void {
    const children = this.currentLayer.getChildren();
    const latestLinePainted = children[children.length - 1] as Line;

    // 最新のLineが途中であれば、それのみ差し替えて描画することで処理を軽減する
    if (latestLinePainted && !latestLinePainted.isFinished) {
      latestLinePainted.remove();
    }
    if (noteInstance.currentPage.lines.length > 0) {
      this.currentLayer.add(noteInstance.currentPage.latestLine);
    }

    this.currentLayer.batchDraw();
  }

  @Watch('note.shouldRepaint')
  public repaintAll(): void {
    if (noteInstance.shouldRepaint) {
      this.currentLayer.removeChildren();

      noteInstance.currentPage.lines.forEach((line: Konva.Line) => {
        this.currentLayer.add(line);
      });

      this.paintBackground();
      this.paintOnion();
      this.currentLayer.batchDraw();
      noteInstance.shouldRepaint = false;
    }
  }

  private paintOnion(): void {
    if (this.isPlaying) return;
    this.onionLayer.removeChildren();

    // [0, 1, ... onionRange-1]
    const onionIndexList: number[] = [...Array(noteInstance.onionRange).keys()];
    const onionMixRateList: number[] = [0.5, 0.7, 0.8];

    // より前のページから描画していくため反転
    onionIndexList.reverse().forEach((onionIndex: number) => {
      const onionRelativeIndex = -(onionIndex + 1);
      if (noteInstance.pageIndex + onionRelativeIndex < 0) return;

      noteInstance.relativePage(onionRelativeIndex).lines.forEach((line: Line) => {
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

  private paintBackground(): void {
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

  public toDataUrl(pageIndex: number): string {
    noteInstance.pageIndex = pageIndex;
    this.repaintAll();

    this.onionLayer.hide();
    const dataUrl: string = this.stage!.toDataURL();
    this.onionLayer.show();

    return dataUrl;
  }

  public toDataUrlArray(): string[] {
    const currentPageIndex = noteInstance.pageIndex;
    let data = [];
    noteInstance.flipPage(0);

    this.onionLayer.hide();
    for (let i = 0; i < noteInstance.pages.length; i++) {
      const currentPageDataUrl = this.stage!.toDataURL();
      data.push(currentPageDataUrl);
      noteInstance.pushPage(true);
    }
    this.onionLayer.show();

    noteInstance.flipPage(currentPageIndex);
    return data;
  }

  public async toDataUrlGif(): Promise<string> {
    let data = this.toDataUrlArray().map((dataUrl: string) => {
      return dataUrl.split(';base64,')[1];
    });

    const form = new FormData();
    form.append('fps', noteInstance.fps.toString());
    form.append('text', data.join('@'));

    const response = await fetch(
      noteInstance.apiUrl + '/encode',
      {method: 'POST', body: form, mode: 'cors', credentials: 'include'},
    );
    const json: { base64: string } = await response.json();
    return json.base64;
  }
}
</script>
