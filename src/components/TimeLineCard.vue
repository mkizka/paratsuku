<template>
  <div class="modal-card">
    <section class="modal-card-body">
      <div class="list is-hoverable">
        <template v-for="(image, i) in images">
          <div
            class="list-item" @click="note.flipPage(parseInt(i))"
            :class="{ 'is-selected': note.pageIndex === parseInt(i)}"
          >
            <img class="list-item-image" :src="'data:image/png;base64,' + image" :alt="`${i + 1}ページ目`">
          </div>
        </template>
      </div>
    </section>
    <section class="modal-card-foot">
      <div class="buttons">
        <b-button @click="note.deletePage()" :disabled="note.pages.length <= 1">削除</b-button>
        <b-button @click="note.insertPage()">追加</b-button>
        <b-button @click="note.copyPage()">複製</b-button>
        <b-button @click="note.exchangePage(-1)" :disabled="note.pageIndex === 0">
          上と交換
        </b-button>
        <b-button @click="note.exchangePage(1)" :disabled="note.pageIndex === note.pages.length - 1">
          下と交換
        </b-button>
      </div>
    </section>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Watch, } from 'vue-property-decorator';
import { Note, noteInstance } from '@/store/note';

@Component
export default class TimeLineCard extends Vue {
  private note: Note = noteInstance;

  @Watch('note.pages')
  get images() {
    return this.note.toDataUrlArray();
  }
}
</script>

<style>
.is-selected {
  background-color: #cccccc;
}

.list-item-image {
  height: 10rem;
  width: auto;
}
</style>
