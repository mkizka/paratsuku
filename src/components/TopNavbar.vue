<template>
  <b-navbar type="is-primary" fixed-top>
    <template slot="brand">
      <b-navbar-item href="/">
        <h1>Paratsuku</h1>
      </b-navbar-item>
    </template>

    <template slot="end">
      <b-navbar-item tag="div">
        <b-button
          type="is-link"
          @click="login"
          v-if="!isAuthenticated"
        >
          ログイン
        </b-button>
        <b-button type="is-info" @click="note.save()" v-else>
          ツイート
        </b-button>
      </b-navbar-item>
    </template>
  </b-navbar>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import { Note, noteInstance } from '@/store/note';

@Component
export default class TopNavbar extends Vue {
  private note: Note = noteInstance;
  private isAuthenticated: boolean = false;
  private loginUrl: string = '';

  mounted(): void {
    this.loginStateUpdate();
  }

  private loginStateUpdate(): void {
    fetch('http://localhost:8000/para/auth', {mode: 'cors', credentials: 'include'})
      .then((response: Response) => response.json())
      .then((json: { isAuthenticated: boolean, loginUrl: string }) => {
        this.isAuthenticated = json.isAuthenticated;
        this.loginUrl = json.loginUrl;
      });
  }

  private login(): void {
    const loginWindow = window.open(this.loginUrl, 'ログイン',
      'width=400, height=300, menubar=no, toolbar=no, scrollbars=yes');
    const loginDetectInterval = setInterval(() => {
      if (loginWindow!.closed) {
        clearInterval(loginDetectInterval);
        this.loginStateUpdate();
      }
    }, 100);
  }
}
</script>
