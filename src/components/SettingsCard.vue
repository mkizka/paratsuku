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
      <b-field grouped position="is-centered">
        <b-field :label="'ペンの太さ ' + ('00' + pen.strokeWidth).slice(-2)" expanded>
          <b-slider v-model="pen.strokeWidth" :min="1" :max="30"></b-slider>
        </b-field>
        <b-field :label="'消しゴムの太さ ' + ('00' + pen.eraserWidth).slice(-2)" expanded>
          <b-slider v-model="pen.eraserWidth" :min="1" :max="30"></b-slider>
        </b-field>
      </b-field>
      <b-field grouped position="is-centered">
        <b-field label="色テーマ">
          <b-select v-model="color">
            <option
              v-for="palette in colorSet"
              :value="palette.color"
              :key="palette.color">
              {{ palette.label }}
            </option>
          </b-select>
        </b-field>
        <b-field label="ページ追加時にコピー">
          <b-switch v-model="note.isCopyMode">
          </b-switch>
        </b-field>
      </b-field>
      <b-field grouped position="is-centered">
        <b-field :label="'再生速度' + ('00' + note.fps).slice(-2) + 'fps'" expanded>
          <b-slider v-model="note.fps" :min="1" :max="30"></b-slider>
        </b-field>
        <b-field :label="`透過枚数 ${note.onionRange}枚`" expanded>
          <b-slider v-model="note.onionRange" :min="0" :max="3" tooltip ticks></b-slider>
        </b-field>
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
    this.note.paintBackground();
    this.note.repaintAll();
  }

  @Watch('note.onionRange')
  private onionRangeOnChange() {
    this.note.repaintAll();
  }
}
</script>
