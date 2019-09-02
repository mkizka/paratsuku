<template>
  <div id="app">
    <TopNavbar/>
    <CustomCanvas/>
    <BottomMenu/>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import CustomCanvas from '@/components/CustomCanvas.vue';
import BottomMenu from '@/components/BottomMenu.vue';
import TopNavbar from '@/components/TopNavbar.vue';

import '../node_modules/@fortawesome/fontawesome-free/css/all.css';
import 'buefy/dist/buefy.css';

@Component({
  components: {TopNavbar, BottomMenu, CustomCanvas}
})
export default class App extends Vue {
}
</script>

<style>
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
}
</style>
