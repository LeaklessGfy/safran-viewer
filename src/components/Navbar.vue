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
          <b-button variant="primary" size="sm" class="my-2 my-sm-0" v-b-modal.syncModal>
            <v-icon name="sync"/> Synchroniser
          </b-button>
        </b-nav-form>
      </b-navbar-nav>
    </b-collapse>

    <b-modal
      id="syncModal"
      title="Synchroniser"
      size="lg"
      header-bg-variant="info"
      header-text-variant="light"
      ok-variant="info"
      ok-title="Synchroniser"
      @show="fetchChanges"
      @ok="sync"
    >
      <b-card-group deck>
        <b-card bg-variant="light" header="Local Changes" class="text-center">
          <b-list-group>
            <b-list-group-item
              v-for="(change, i) in localChanges.results"
              v-bind:key="i"
              class="text-left"
              button
              v-b-toggle="'local'+i"
            >
              <div v-if="!change.deleted">
                <v-icon name="plus" class="text-success"/>
                {{ change.doc.type + " - " + change.doc.name }}
              </div>

              <div v-else>
                <v-icon name="minus" class="text-danger"/>
                {{ change.doc._id }}
              </div>

              <b-collapse :id="'local'+i" class="mt-2 border">
                <pre>{{ JSON.stringify(change, undefined, 2) }}</pre>
              </b-collapse>
            </b-list-group-item>
          </b-list-group>
        </b-card>

        <v-icon name="sync-alt" class="text-info mt-2" scale="3" spin/>

        <b-card bg-variant="dark" text-variant="white" header="Remote Changes" class="text-center">
          <b-list-group variant="dark">
            <b-list-group-item
              v-for="(change, i) in remoteChanges.results"
              v-bind:key="i"
              class="text-left"
              button
              v-b-toggle="'remote'+i"
            >
              <div v-if="!change.deleted">
                <v-icon name="plus" class="text-success"/>
                {{ change.doc.type + " - " + change.doc.name }}
              </div>

              <div v-else>
                <v-icon name="minus" class="text-danger"/>
                {{ change.doc._id }}
              </div>

              <b-collapse :id="'remote'+i" class="mt-2 border">
                <pre>{{ JSON.stringify(change, undefined, 2) }}</pre>
              </b-collapse>
            </b-list-group-item>
          </b-list-group>
        </b-card>
      </b-card-group>
    </b-modal>
  </b-navbar>
</template>

<script>
import { sync, localChanges, remoteChanges } from "../services/db";

export default {
  data: () => ({
    localChanges: [],
    remoteChanges: []
  }),
  methods: {
    sync() {
      if (this.localChanges.results.length > 0 || this.remoteChanges.results.length > 0) {
        sync(this.localChanges.last_seq, this.remoteChanges.last_seq);
      }
    },
    async fetchChanges() {
      this.localChanges = await localChanges();
      this.remoteChanges = await remoteChanges();
    }
  }
};
</script>
