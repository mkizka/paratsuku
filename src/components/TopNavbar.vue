<template>
  <b-navbar type="is-dark" fixed-top>
    <template slot="brand">
      <b-navbar-item>
        <h1>{{ title }}</h1>
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
import { Component, Prop, Vue } from 'vue-property-decorator';
import { DialogProgrammatic as Dialog } from 'buefy';

@Component
export default class TopNavbar extends Vue {
  @Prop()
  title!: string;

  private about(): void {
    Dialog.alert({
      title: 'パラツク -Paratsuku- とは',
      message: '<div class="content">' +
        '<p>パラパラ漫画を書いてすぐツイート出来るツール。' +
        '<a href="https://www.nintendo.co.jp/3ds/dl/jkzj/" target="_blank">うごくメモ帳</a>と' +
        '<a href="https://www.kannagi.net/TEGAKI/" target="_blank">TEGAKI Draw And Tweet</a>にところどころ影響を受けている。</p>' +
        '<p>ツイート部分はツクリガの認証機能を使っている(手抜き)ため、' +
        '未登録の人はログインすると同時にツクリガアカウントも作成されるので注意してください。</p>' +
        '<p>利用にあたっての注意事項は<a href="https://tsukuriga.net/pages/guide#paratsuku" target="_blank">ユーザーガイド</a>を参照のこと。</p>' +
        '</div>',
      type: 'is-dark'
    });
  }
}
</script>
