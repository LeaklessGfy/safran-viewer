<template>
  <div>
    <b-button variant="primary" size="sm" class="mx-2" v-b-modal.syncModal>
      <v-icon name="sync"/> Synchroniser
    </b-button>
    <b-modal
      id="syncModal"
      title="Synchroniser"
      size="xl"
      header-bg-variant="info"
      header-text-variant="light"
      ok-variant="info"
      ok-title="Synchroniser"
      @show="fetchChanges"
      @ok="sync"
    >
      <b-card-group deck>
        <sync-tab
          bgVariant="light"
          header="Local Changes"
          :changes="changes.local.results"
          type="local"
        />

        <v-icon name="sync-alt" class="text-info mt-2" scale="3" spin/>

        <sync-tab
          bgVariant="dark"
          textVariant="white"
          header="Remote Changes"
          :changes="changes.remote.results"
          type="remote"
        />
      </b-card-group>
    </b-modal>
  </div>
</template>

<script>
import SyncTap from './SyncTab';

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
      this.$db.sync(this.changes);
    },
    async fetchChanges() {
      this.changes = await this.$db.changes();
    }
  },
  components: {
    'sync-tab': SyncTap
  }
};
</script>
