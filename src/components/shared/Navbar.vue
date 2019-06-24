<template>
  <b-navbar
    toggleable="lg"
    type="dark"
    variant="dark"
  >
    <b-navbar-brand href="#/">
      Safran Viewer
    </b-navbar-brand>

    <b-navbar-toggle target="nav_collapse" />

    <b-collapse
      id="nav_collapse"
      is-nav
    >
      <b-navbar-nav>
        <b-nav-item href="#/dashboard">
          Dashboard
        </b-nav-item>
        <b-nav-item href="#/plugins">
          Plugins
        </b-nav-item>
        <b-nav-item href="#/protocol">
          Protocole
        </b-nav-item>
        <b-nav-item href="#/import">
          Import
        </b-nav-item>
        <b-nav-item href="#/config">
          Config
        </b-nav-item>
      </b-navbar-nav>

      <b-navbar-nav class="ml-auto">
        <b-button
          v-if="loading"
          variant="info"
          size="sm"
          class="mx-2"
        >
          <b-spinner
            small
            label="Loading..."
            variant="light"
            type="grow"
          /> Chargement...
        </b-button>
      </b-navbar-nav>
      <notifications position="top right" />
    </b-collapse>
  </b-navbar>
</template>

<script>
import { loading$, error$ } from '@/services/db/subjects';

export default {
  name: 'Navbar',
  data() {
    return {
      subLoading: null,
      subError: null,
      loading: false,
      error: null
    };
  },
  mounted() {
    this.subLoading = loading$.subscribe(loading => this.loading = loading);
    this.subError = error$.subscribe(error => {
      this.$notify({
        type: 'error',
        title: 'Erreur',
        text: error,
        duration: 5000
      });
    });
  },
  destroyed() {
    this.subLoading.unsubscribe();
    this.subError.unsubscribe();
  }
};
</script>
