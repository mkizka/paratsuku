<template>
  <div id="TopNavbar">
    <b-navbar type="is-primary" fixed-top>
      <template slot="brand">
        <b-navbar-item href="/">
          <h1>Paratsuku</h1>
        </b-navbar-item>
      </template>
      <template slot="end">
        <b-navbar-item tag="div">
          <b-button
            icon-pack="fas" icon-left="signup" type="is-link"
            @click="login" :disabled="note.isPlaying" v-if="!isAuthenticated"
          >
            ログイン
          </b-button>
          <b-button
            icon-pack="fab" icon-left="twitter" type="is-info"
            @click="hasTweeterActive = true" :disabled="note.isPlaying" v-else
          >
            ツイート
          </b-button>
        </b-navbar-item>
      </template>
    </b-navbar>
    <b-modal :active.sync="hasTweeterActive" has-modal-card>
      <TweetCard/>
    </b-modal>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import { Note, noteInstance } from '@/store/note';
import TweetCard from '@/components/TweetCard.vue';

@Component({
  components: {TweetCard}
})
export default class TopNavbar extends Vue {
  private note: Note = noteInstance;
  private loginUrl: string = '';
  private isAuthenticated: boolean = false;
  private hasTweeterActive: boolean = false;

  mounted(): void {
    this.loginStateUpdate();
  }

  private loginStateUpdate(): void {
    fetch(noteInstance.endpointHost + '/para/auth', {mode: 'cors', credentials: 'include'})
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
