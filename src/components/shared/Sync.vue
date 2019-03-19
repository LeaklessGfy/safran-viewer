<template>
  <div>
    <b-button variant="primary" size="sm" class="mx-2" v-b-modal.syncModal>
      <v-icon name="sync"/> Synchroniser
    </b-button>
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
              v-for="(change, i) in changes.local.results"
              v-bind:key="i"
              class="text-left"
              button
              v-b-toggle="'local'+i"
            >
              <div v-if="!change.deleted">
                <v-icon name="plus" class="text-success"/>
                {{ change.doc.type + " - " + (change.doc.name ? change.doc.name : 'design') }}
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
              v-for="(change, i) in changes.remote.results"
              v-bind:key="i"
              class="text-left"
              button
              v-b-toggle="'remote'+i"
            >
              <div v-if="!change.deleted">
                <v-icon name="plus" class="text-success"/>
                {{ change.doc._id + " - " + (change.doc.name ? change.doc.name : 'design') }}
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
  </div>
</template>

<script>
import Db from '../../services/db';

export default {
  data: () => ({
    changes: {
      local: [],
      remote: [],
      length: 0
    }
  }),
  methods: {
    sync() {
      Db.sync(this.changes);
    },
    async fetchChanges() {
      this.changes = await Db.changes();
    }
  }
};
</script>
