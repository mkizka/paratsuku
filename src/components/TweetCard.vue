<template>
  <div class="modal-card">
    <section class="modal-card-body">
      <b-field label="ツイート文">
        <b-input maxlength="100" type="textarea" v-model="text"></b-input>
      </b-field>
      <b-field label="プレビュー">
        <b-icon
          type="is-primary" size="is-medium" pack="fas"
          icon="spinner" custom-class="fa-spin" v-if="!gif"
        />
        <img :src="gifUrl" width="80%" height="auto" alt="プレビュー" v-else/>
      </b-field>
      <b-field>
        <b-button
          icon-pack="fab" icon-left="twitter" type="is-primary"
          :disabled="!gif || isTweeting" :loading="isTweeting" @click="tweet"
        >
          ツイート
        </b-button>
      </b-field>
    </section>
  </div>
</template>

<script lang="ts">
import { Component, Vue, } from 'vue-property-decorator';
import { NotificationProgrammatic as Notification, ModalProgrammatic as Modal } from 'buefy';
import { noteInstance } from '@/store/note';

@Component
export default class TweetCard extends Vue {
  private gif: string = '';
  private text: string = '';
  private isTweeting: boolean = false;

  async mounted(): Promise<void> {
    this.gif = await noteInstance.toDataUrl();
  }

  private get gifUrl(): string {
    return 'data:image/gif;base64,' + this.gif;
  }

  private tweet(): void {
    this.isTweeting = true;

    const form = new FormData();
    form.append('text', this.text);
    form.append('media', this.gif);

    fetch(noteInstance.endpointHost + '/para/tweet', {method: 'POST', body: form, mode: 'cors', credentials: 'include'})
      .then((response: Response) => response.json())
      .then((json: { isTweeted: false }) => {
        (this.$parent as any).close();
        Notification.open(json.isTweeted ? 'ツイートしました' : 'ツイートに失敗しました');
      });
  }
}
</script>
