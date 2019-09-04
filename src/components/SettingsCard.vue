<template>
  <div class="card">
    <div class="card-content">
      <div class="content">
        <section>
          <label class="label">ツール選択</label>
          <b-field>
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
          <b-field label="線の太さ">
            <b-slider v-model="pen.strokeWidth" :min="1" :max="30"></b-slider>
          </b-field>
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
        </section>
      </div>
    </div>
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
  }
}
</script>
