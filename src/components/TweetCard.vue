<template>
  <div class="modal-card">
    <section class="modal-card-body">
      <b-field label="ツイート文">
        <b-input maxlength="100" type="textarea" v-model="text" ref="textarea"></b-input>
      </b-field>
      <b-field label="プレビュー">
        <b-icon
          type="is-primary" size="is-medium" pack="fas"
          icon="spinner" custom-class="fa-spin" v-if="!gif"
        />
        <img :src="gifUrl" width="200" height="auto" alt="プレビュー" v-else/>
      </b-field>
      <label class="label">注意</label>
      <b-field>
        <p class="help" v-if="!isAuthenticated">
          ツイートにはツイッター連携済みの<a href="https://tsukuriga.net" target="_blank">ツクリガ</a>のアカウントが必要です。
          <b><span class="fas fa-sign-in-alt"></span>ログイン</b>ボタンを押すとツイッターアカウントを利用してツクリガへのログイン、
          または新規アカウントの作成を行い、ツイートのための権限を取得します。<br>
          詳しくは<a href="https://tsukuriga.net/pages/guide#paratsuku" target="_blank">ユーザーガイド</a>へ
        </p>
        <p class="help" v-else>
          ツイートには<a href="https://tsukuriga.net" target="_blank">ツクリガ</a>で現在ログイン中のアカウントに連携しているツイッターアカウントを使用します。<br>
          すでにツクリガでツイッター連携をしていてもアクセス情報が古く書き込み権限が使用できない場合があります。エラーが出る場合はツクリガからログアウトし、再度ツイッター連携でログインを行ってください。<br>
          詳しくは<a href="https://tsukuriga.net/pages/guide#paratsuku" target="_blank">ユーザーガイド</a>へ
        </p>
      </b-field>
      <b-field>
        <b-button
          icon-pack="fas" icon-left="sign-in-alt" type="is-dark"
          @click="login" v-if="!isAuthenticated"
        >
          ログイン
        </b-button>
        <b-button
          icon-pack="fab" icon-left="twitter" type="is-dark"
          :disabled="!gif || isTweeting" :loading="isTweeting" @click="tweet"
          v-else
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
  private loginUrl: string = '';
  private isAuthenticated: boolean = false;
  private gif: string = '';
  private text: string = 'https://para.tsukuriga.net #tsukuriga';
  private isTweeting: boolean = false;

  async created(): Promise<void> {
    await this.loginStateUpdate();
  }

  async mounted(): Promise<void> {
    this.gif = await (this.$root.$children[0].$refs.canvas as any).toDataUrlGif();
    if (this.isAuthenticated) {
      (this.$refs.textarea as HTMLInputElement).focus();
    }
  }

  private async loginStateUpdate(): Promise<void> {
    const response: Response = await fetch(noteInstance.apiUrl + '/auth', {
      mode: 'cors',
      credentials: 'include'
    });
    const json: { isAuthenticated: boolean, loginPath: string } = await response.json();
    this.isAuthenticated = json.isAuthenticated;
    this.loginUrl = noteInstance.apiUrl + json.loginPath;
  }

  private login(): void {
    const loginWindow = window.open(this.loginUrl, 'ログイン',
      'width=800, height=600, menubar=no, toolbar=no, scrollbars=yes');
    const loginDetectInterval = setInterval(() => {
      if (loginWindow!.closed) {
        clearInterval(loginDetectInterval);
        this.loginStateUpdate();
      }
    }, 100);
  }

  private get gifUrl(): string {
    return 'data:image/gif;base64,' + this.gif;
  }

  private async tweet(): Promise<void> {
    this.isTweeting = true;

    const form = new FormData();
    form.append('text', this.text);
    form.append('media', this.gif);

    const response: Response = await fetch(noteInstance.apiUrl + '/tweet', {
      method: 'POST',
      body: form,
      mode: 'cors',
      credentials: 'include'
    });
    const json: { isTweeted: false, message: string } = await response.json();
    (this.$parent as any).close();
    Notification.open({
      type: json.isTweeted ? 'is-success' : 'is-danger',
      message: json.message,
      duration: 5
    });
  }
}
</script>
