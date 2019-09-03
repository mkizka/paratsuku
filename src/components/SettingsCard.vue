<template>
  <div class="card">
    <div class="card-content">
      <div class="container">
        <div class="columns is-centered">
          <compact-color v-model="colors"/>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Watch } from 'vue-property-decorator';
import { Compact } from 'vue-color';

import { penInstance, Pen } from '@/store/pen';

import Buefy from 'buefy';

Vue.use(Buefy);

@Component({
  components: {'compact-color': Compact}
})
export default class SettingsCard extends Vue {
  private pen: Pen = penInstance;
  private isActive: boolean = false;
  private colors: { hex: string } = {hex: penInstance.color};

  @Watch('colors')
  private colorsOnChange() {
    this.pen.color = this.colors.hex;
  }
}
</script>
