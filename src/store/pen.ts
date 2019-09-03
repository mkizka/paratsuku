import Vue from 'vue';

export enum PenType {
  normal = 'source-over',
  eraser = 'destination-out',
}

export class Pen {
  public color: string = '#df4b26';
  public strokeWidth: number = 5;
  public type: PenType = PenType.normal;

  public toggle(): void {
    this.type = this.type === PenType.normal ? PenType.eraser : PenType.normal;
  }
}

export const penInstance = Vue.observable(new Pen());
