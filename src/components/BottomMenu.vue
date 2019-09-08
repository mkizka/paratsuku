<template>
  <div id="BottomMenu">
    <b-modal :active.sync="hasSettingsActive" has-modal-card>
      <SettingsCard/>
    </b-modal>
    <b-modal :active.sync="hasTweeterActive" has-modal-card>
      <TweetCard/>
    </b-modal>
    <b-modal :active.sync="hasTimelineActive" has-modal-card>
      <TimeLineCard/>
    </b-modal>
    <div :class="'bottom-menu-buttons' + (isHidden ? ' is-avoided' : '')" ref="menu">
      <b-button
        type="is-dark" size="is-small" style="width: 100%;margin-bottom: 2px"
        @click="hasTimelineLoading = true" :loading="hasTimelineLoading"
      >
        {{ note.pageStateDisplay }}
      </b-button>
      <div class="buttons are-medium has-addons">
        <b-button type="is-dark" @click="hasSettingsActive = true">
          <b-icon pack="fas" icon="pen" v-if="pen.type === 'source-over'"></b-icon>
          <b-icon pack="fas" icon="eraser" v-else></b-icon>
        </b-button>
        <b-button type="is-dark" @click="note.currentPage.undo()"
                  :disabled="note.currentPage.lines.length === 0 || note.isPlaying">
          <b-icon pack="fas" icon="undo"></b-icon>
        </b-button>
        <b-button type="is-dark" @click="note.currentPage.redo()"
                  :disabled="note.currentPage.redoableLines.length === 0 || note.isPlaying">
          <b-icon pack="fas" icon="redo"></b-icon>
        </b-button>
        <b-button type="is-dark" @click="note.backPage()"
                  :disabled="note.isPlaying">
          <b-icon pack="fas" icon="chevron-left"></b-icon>
        </b-button>
        <b-button type="is-dark" @click="note.play()">
          <b-icon pack="fas" icon="stop" v-if="note.isPlaying"></b-icon>
          <b-icon pack="fas" icon="play" v-else></b-icon>
        </b-button>
        <b-button type="is-dark" @click="note.pushPage()"
                  :disabled="note.isPlaying">
          <b-icon pack="fas" icon="chevron-right"></b-icon>
        </b-button>
        <b-button type="is-dark" @click="hasTweeterActive = true"
                  :disabled="note.isPlaying">
          <b-icon pack="fab" icon="twitter"></b-icon>
        </b-button>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Watch } from 'vue-property-decorator';

import SettingsCard from '@/components/SettingsCard.vue';
import TweetCard from '@/components/TweetCard.vue';
import TimeLineCard from '@/components/TimeLineCard.vue';
import { noteInstance, Note } from '@/store/note';
import { penInstance, Pen } from '@/store/pen';

import Buefy from 'buefy';

Vue.use(Buefy);

@Component({
  components: {TimeLineCard, TweetCard, SettingsCard}
})
export default class BottomMenu extends Vue {
  private note: Note = noteInstance;
  private pen: Pen = penInstance;
  private isHidden: boolean = false;
  private hasSettingsActive: boolean = false;
  private hasTweeterActive: boolean = false;
  private hasTimelineActive: boolean = false;
  private hasTimelineLoading: boolean = false;

  @Watch('hasTimelineLoading')
  private hasTimelineLoadingWatcher() {
    // ローディングを先に発火することでタイムラインプレビュー生成前にローディングを表示させる
    if (this.hasTimelineLoading) {
      setTimeout(() => {
        this.hasTimelineActive = true;
      }, 10);
    }
  }

  @Watch('hasTimelineActive')
  private hasTimelineActiveWatcher() {
    if (!this.hasTimelineActive) {
      this.hasTimelineLoading = false;
    }
  }

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
  opacity: 0.95;
}

.is-avoided {
  opacity: 0.5;
  pointer-events: none;
}
</style>
