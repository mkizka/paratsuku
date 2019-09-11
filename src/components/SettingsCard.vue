<template>
  <div class="modal-card">
    <section class="modal-card-body">
      <label class="label">ツール選択</label>
      <b-field grouped position="is-centered">
        <b-radio-button
          v-model="pen.type"
          :native-value="penType.normal"
          type="is-primary"
        >
          <b-icon pack="fas" icon="pen"></b-icon>
          <span>ペン</span>
        </b-radio-button>
        <b-radio-button
          v-model="pen.type"
          :native-value="penType.eraser"
          type="is-primary"
        >
          <b-icon pack="fas" icon="eraser"></b-icon>
          <span>消しゴム</span>
        </b-radio-button>
      </b-field>
      <label class="label">ペンの太さ {{ pen.strokeWidth }}</label>
      <b-field grouped position="is-centered">
        <b-slider v-model="pen.strokeWidth" :min="1" :max="30"></b-slider>
      </b-field>
      <label class="label">消しゴムの太さ {{ pen.eraserWidth }}</label>
      <b-field grouped position="is-centered">
        <b-slider v-model="pen.eraserWidth" :min="1" :max="30"></b-slider>
      </b-field>
      <label class="label">色テーマ</label>
      <b-field grouped position="is-centered">
        <b-select v-model="color">
          <option
            v-for="palette in colorSet"
            :value="palette.color"
            :key="palette.color">
            {{ palette.label }}
          </option>
        </b-select>
      </b-field>
      <label class="label">再生速度 {{ note.fps }}fps</label>
      <b-field grouped position="is-centered">
        <b-slider v-model="note.fps" :min="1" :max="30"></b-slider>
      </b-field>
      <label class="label">透過枚数 {{ note.onionRange }}ページ</label>
      <b-field grouped position="is-centered">
        <b-slider v-model="note.onionRange" :min="0" :max="3" tooltip ticks></b-slider>
      </b-field>
    </section>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Watch } from 'vue-property-decorator';
import { Note, noteInstance } from '@/store/note';
import { Pen, penInstance, PenType, ColorPalette, colorSet } from '@/store/pen';

import Buefy from 'buefy';

Vue.use(Buefy);

@Component
export default class SettingsCard extends Vue {
  private note: Note = noteInstance;
  private pen: Pen = penInstance;
  private colorSet: ColorPalette[] = colorSet;
  private color: string = penInstance.palette.color;

  private penType = PenType;

  @Watch('color')
  private colorOnChange() {
    this.pen.setColor(this.color);
    this.note.shouldRepaint = true;
  }

  @Watch('note.onionRange')
  private onionRangeOnChange() {
    this.note.shouldRepaint = true;
  }
}
</script>
