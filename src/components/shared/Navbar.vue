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
        <b-button :variant="db === 'local' ? 'light' : 'dark'" size="sm" class="mx-2" @click="changeDb">
          <v-icon name="database"/> {{ db.toUpperCase() }}
        </b-button>
        <sync/>
      </b-navbar-nav>
    </b-collapse>
  </b-navbar>
</template>

<script>
import Sync from './Sync';

export default {
  subscriptions() {
    return {
      db: this.$db.fetchCurrentDb()
    }
  },
  methods: {
    changeDb() {
      this.$db.changeDb();
    }
  },
  components: {
    sync: Sync
  }
};
</script>
