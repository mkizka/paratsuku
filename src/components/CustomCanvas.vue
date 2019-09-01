<template>
  <div>
    <button @click="note.pushPage()">push</button>
    <button @click="note.backPage()">back</button>
    <button @click="pen.toggle()">toggle</button>
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
