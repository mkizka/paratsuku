<template>
  <div id="BottomMenu" ref="menu" v-show="!isHidden">
    <button @click="note.pushPage()">push</button>
    <button @click="note.backPage()">back</button>
    <button @click="pen.toggle()">{{ pen.type }}</button>
    <button @click="note.currentPage.undo()">undo</button>
    <button @click="note.currentPage.redo()">redo</button>
    <button @click="note.play()">{{ note.isPlaying ? 'stop' : 'play' }}</button>
    <span>{{ note.pageStateDisplay }}</span>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import { noteInstance, Note } from '@/store/note';
import { penInstance, Pen } from '@/store/pen';

@Component
export default class BottomMenu extends Vue {
  private note: Note = noteInstance;
  private pen: Pen = penInstance;
  private isHidden: boolean = false;

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
#BottomMenu {
  width: fit-content;
  margin: auto;
  position: fixed;
  bottom: 20px;
  right: 0;
  left: 0;
}
</style>
