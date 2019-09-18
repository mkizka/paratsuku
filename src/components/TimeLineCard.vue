<template>
  <div class="modal-card">
    <section class="modal-card-body">
      <div class="list is-hoverable">
        <template v-for="(image, i) in images">
          <div
            class="list-item" :data-page-index="i"
            @click="note.flipPage(parseInt(i))" :class="{ 'is-selected': nowIndex === parseInt(i)}"
          >
            <img class="list-item-image" :src="image" :alt="`${i + 1}ページ目`">
          </div>
        </template>
      </div>
    </section>
    <section class="modal-card-foot">
      <div class="buttons">
        <b-button @click="deletePage" :disabled="note.pages.length <= 1">削除</b-button>
        <b-button @click="insertPage">追加</b-button>
        <b-button @click="copyPage">複製</b-button>
        <b-button @click="exchangePage(-1)" :disabled="note.pageIndex === 0">
          上と交換
        </b-button>
        <b-button @click="exchangePage(1)" :disabled="note.pageIndex === note.pages.length - 1">
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
  private images: string[] = [];
  private nowIndex: number = noteInstance.pageIndex;

  mounted() {
    this.images = this.note.toDataUrlArray();
  }

  @Watch('note.pageIndex', {immediate: true})
  private update() {
    this.nowIndex = noteInstance.pageIndex;
    setTimeout(() => {
      document.querySelector(`div[data-page-index="${this.nowIndex}"]`)!.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
        inline: 'nearest',
      });
    }, 100);
  }

  private deletePage() {
    noteInstance.deletePage();
    this.images.splice(this.nowIndex, 1);
  }

  private insertPage() {
    noteInstance.insertPage();
    this.images.splice(this.nowIndex, 0, noteInstance.toDataUrl(this.nowIndex));
  }

  private copyPage() {
    noteInstance.copyPage();
    this.images.splice(this.nowIndex, 0, noteInstance.toDataUrl(this.nowIndex + 1));
  }

  private exchangePage(i: number) {
    noteInstance.exchangePage(i);
    [this.images[this.nowIndex], this.images[this.nowIndex + i]] =
      [this.images[this.nowIndex + i], this.images[this.nowIndex]];
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
