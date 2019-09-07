<template>
  <div id="CustomCanvas"></div>
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
    this.note.initStage('#CustomCanvas');
  }
}
</script>
