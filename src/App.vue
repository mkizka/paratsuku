<template>
  <div id="app">
    <img alt="Vue logo" src="./assets/logo.png">
    <p>{{ store.count }}</p>
    <button @click="increment">+1</button>
    <button @click="decrement">-1</button>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import { storeInstance } from './store';

@Component
export default class App extends Vue {
  public store = storeInstance;

  public increment() {
    this.store.increment();
  }

  public decrement() {
    this.store.decrement();
  }
}
</script>

<style>
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
