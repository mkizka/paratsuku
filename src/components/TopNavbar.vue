<template>
  <b-navbar type="is-dark" fixed-top>
    <template slot="brand">
      <b-navbar-item href="/">
        <h1>Paratsuku</h1>
      </b-navbar-item>
    </template>
    <template slot="start">
      <div class="buttons">
        <b-button type="is-dark" @click="about">パラツクとは</b-button>
        <b-button
          type="is-dark" tag="a" href="https://tsukuriga.net" target="_blank"
          icon-pack="fas" icon-right="external-link-alt"
        >
          ツクリガとは
        </b-button>
        <b-button
          type="is-dark" tag="a" href="https://twitter.com/ugo_compeito" target="_blank"
          icon-pack="fas" icon-right="external-link-alt"
        >
          作った人
        </b-button>
      </div>
    </template>
  </b-navbar>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import { DialogProgrammatic as Dialog } from 'buefy';

@Component
export default class TopNavbar extends Vue {
  private about(): void {
    Dialog.alert({
      title: 'Paratsuku -パラツク- とは',
      message: '<div class="content">' +
        '<p>パラパラ漫画を書いてすぐツイート出来るツール。</p>' +
        '<p>もともとはアプリとして作ったがiOS版が作れなかったりいろいろあってブラウザ版として作り直した。</p>' +
        '<p>ツイート部分はツクリガの認証機能を使っている(手抜き)ため、' +
        '未登録の人はログインすると同時にツクリガアカウントも作成されるので注意してください。</p>' +
        '</div>',
      type: 'is-dark'
    });
  }
}
</script>
