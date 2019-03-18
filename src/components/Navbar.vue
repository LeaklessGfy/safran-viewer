<template>
  <b-navbar toggleable="lg" type="dark" variant="info">
    <b-navbar-brand href="#/">Safran Viewer</b-navbar-brand>

    <b-navbar-toggle target="nav_collapse" />

    <b-collapse is-nav id="nav_collapse">
      <b-navbar-nav>
        <b-nav-item href="#/protocol">Protocol</b-nav-item>
        <b-nav-item href="#/import">Import</b-nav-item>
        <b-nav-item href="#/config">Config</b-nav-item>
      </b-navbar-nav>

      <b-navbar-nav class="ml-auto">
        <b-nav-form>
          <b-button variant="primary" size="sm" class="my-2 my-sm-0" @click="onSync">
            <v-icon name="sync"/> Sync
          </b-button>
        </b-nav-form>
      </b-navbar-nav>
    </b-collapse>
  </b-navbar>
</template>

<script>
import { Sync } from "../services/db";

export default {
  methods: {
    onSync: () => Sync()
  }
}
</script>
