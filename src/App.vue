<template>
  <div id="app">
    <TopNavbar :title="title"/>
    <CustomCanvas/>
    <BottomMenu/>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import CustomCanvas from '@/components/CustomCanvas.vue';
import BottomMenu from '@/components/BottomMenu.vue';
import TopNavbar from '@/components/TopNavbar.vue';

import { DialogProgrammatic as Dialog } from 'buefy';
import '../node_modules/@fortawesome/fontawesome-free/css/all.css';
import 'buefy/dist/buefy.css';

@Component({
  components: {TopNavbar, BottomMenu, CustomCanvas}
})
export default class App extends Vue {
  private version = require('../package.json').version;

  get title(): string {
    return 'Paratsuku v' + this.version;
  }

  async mounted() {
    const response: Response = await fetch('https://raw.githubusercontent.com/Compeito/paratsuku/master/package.json');
    const latest: { version: string } = await response.json();
    if (this.version != latest.version) {
      Dialog.confirm({
        message: `アップデート(v${this.version} -> v${latest.version})があります。更新しますか？<br>` +
          '<span class="help">一部の環境ではこの機能は動作しません。キャッシュのクリア、スーパーリロード(Shift + F5など)をお試しください</span>',
        type: 'is-dark',
        onConfirm: () => document.location.reload(true)
      });
    }
  }
}
</script>

<style>
html, body {
  overflow-x: hidden !important;
  overflow-y: hidden !important;
}

#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
}
</style>
