<template>
  <b-navbar type="is-dark" fixed-top>
    <template slot="brand">
      <b-navbar-item href="/">
        <h1>Paratsuku</h1>
      </b-navbar-item>
    </template>
    <template slot="end">
      <b-navbar-item tag="div">

      </b-navbar-item>
    </template>
  </b-navbar>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';

@Component
export default class TopNavbar extends Vue {
}
</script>
