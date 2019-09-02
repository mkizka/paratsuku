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

    const avoidPointerHandler = {
      handleEvent: (event: MouseEvent) => {
        this.isHidden = event.buttons == 1 && window.innerHeight - event.clientY < menuHeight + 40;
      }
    } as EventListenerOrEventListenerObject;

    document.addEventListener('mousemove', avoidPointerHandler);
    document.addEventListener('touchmove', avoidPointerHandler);
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