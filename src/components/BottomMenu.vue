<template>
  <div id="BottomMenu">
    <b-modal :active.sync="hasModalActive" scroll="keep" has-modal-card>
      <SettingsCard/>
    </b-modal>
    <div :class="'bottom-menu-buttons' + (isHidden ? ' is-avoided' : '')" ref="menu">
      <b-button type="is-primary" size="is-medium" @click="hasModalActive = true">
        <b-icon pack="fas" icon="pen" v-if="pen.type === 'source-over'"></b-icon>
        <b-icon pack="fas" icon="eraser" v-else></b-icon>
      </b-button>
      <b-button type="is-primary" size="is-medium" @click="note.currentPage.undo()"
                :disabled="note.currentPage.lines.length === 0 || note.isPlaying">
        <b-icon pack="fas" icon="undo"></b-icon>
      </b-button>
      <b-button type="is-primary" size="is-medium" @click="note.currentPage.redo()"
                :disabled="note.currentPage.redoableLines.length === 0 || note.isPlaying">
        <b-icon pack="fas" icon="redo"></b-icon>
      </b-button>
      <b-button type="is-primary" size="is-medium" style="width: 90px">
        {{ note.pageStateDisplay }}
      </b-button>
      <b-button type="is-primary" size="is-medium" @click="note.backPage()"
                :disabled="note.isPlaying">
        <b-icon pack="fas" icon="chevron-left"></b-icon>
      </b-button>
      <b-button type="is-primary" size="is-medium" @click="note.play()">
        <b-icon pack="fas" icon="stop" v-if="note.isPlaying"></b-icon>
        <b-icon pack="fas" icon="play" v-else></b-icon>
      </b-button>
      <b-button type="is-primary" size="is-medium" @click="note.pushPage()"
                :disabled="note.isPlaying">
        <b-icon pack="fas" icon="chevron-right"></b-icon>
      </b-button>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';

import SettingsCard from '@/components/SettingsCard.vue';
import { noteInstance, Note } from '@/store/note';
import { penInstance, Pen } from '@/store/pen';

import Buefy from 'buefy';

Vue.use(Buefy);

@Component({
  components: {SettingsCard}
})
export default class BottomMenu extends Vue {
  private note: Note = noteInstance;
  private pen: Pen = penInstance;
  private isHidden: boolean = false;
  private hasModalActive: boolean = false;

  mounted() {
    const menuHeight = (this.$refs.menu as Element).clientHeight;
    const offsetHeight = 40;

    const avoidPointerHandler = {
      handleEvent: (event: MouseEvent | TouchEvent) => {
        if (event instanceof MouseEvent) {
          this.isHidden = event.buttons == 1 && window.innerHeight - event.clientY < menuHeight + offsetHeight;
        } else {
          this.isHidden = window.innerHeight - event.touches[0].clientY < menuHeight + offsetHeight;
        }
      }
    } as EventListenerOrEventListenerObject;

    const avoidPointerFinishedHandler = {
      handleEvent: () => {
        this.isHidden = false;
      }
    } as EventListenerOrEventListenerObject;

    document.addEventListener('mousemove', avoidPointerHandler);
    document.addEventListener('touchmove', avoidPointerHandler);
    document.addEventListener('mouseup', avoidPointerFinishedHandler);
    document.addEventListener('touchend', avoidPointerFinishedHandler);
  }
}
</script>

<style>
.bottom-menu-buttons {
  width: fit-content;
  margin: auto;
  position: fixed;
  bottom: 20px;
  right: 0;
  left: 0;
  opacity: 0.9;
}

.is-avoided {
  opacity: 0.2;
  pointer-events: none;
}
</style>
