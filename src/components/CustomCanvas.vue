<template>
  <div>
    <button @click="note.pushPage()">push</button>
    <button @click="note.backPage()">back</button>
    <button @click="pen.toggle()">{{ pen.type }}</button>
    <button @click="note.currentPage.undo()">undo</button>
    <button @click="note.currentPage.redo()">redo</button>
    <button @click="note.play()">{{ note.isPlaying ? 'stop' : 'play' }}</button>
    <span>{{ note.pageStateDisplay }}</span>
    <div id="customCanvasContainer"></div>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import { noteInstance, Note } from '@/store/note';
import { penInstance, Pen } from '@/store/pen';

@Component
export default class CustomCanvas extends Vue {
  private note: Note = noteInstance;
  private pen: Pen = penInstance;

  mounted() {
    this.note.initStage({
      container: 'customCanvasContainer',
      width: window.innerWidth,
      height: window.innerHeight
    });
  }
}
</script>
