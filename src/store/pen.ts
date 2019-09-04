import Vue from 'vue';

export enum PenType {
  normal = 'source-over',
  eraser = 'destination-out',
}

export class ColorPalette {
  public label: string;
  public color: string;
  public backgroundColor: string;

  constructor(label:string, color: string, backgroundColor: string) {
    this.label = label;
    this.color = color;
    this.backgroundColor = backgroundColor;
  }
}

export const colorSet: ColorPalette[] = [
  new ColorPalette('青っぽいの', '#167587', '#13A899'),
  new ColorPalette('赤っぽいの', '#C3635A', '#F7C37B'),
  new ColorPalette('黄っぽいの', '#A5965E', '#452A3A'),
];

export class Pen {
  public palette: ColorPalette = colorSet[0];
  public strokeWidth: number = 5;
  public type: PenType = PenType.normal;

  public setColor(value: string) {
    colorSet.forEach((palette: ColorPalette) => {
      if (palette.color === value) {
        this.palette = palette;
      }
    });
  }

  public toggle(): void {
    this.type = this.type === PenType.normal ? PenType.eraser : PenType.normal;
  }
}

export const penInstance = Vue.observable(new Pen());
