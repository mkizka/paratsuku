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
  new ColorPalette('緑っぽいの', '#358259', '#38b48b'),
  new ColorPalette('青っぽいの', '#2d3c6d', '#37639f'),
  new ColorPalette('灰っぽいの', '#3f525b', '#6c848d'),
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
