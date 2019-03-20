<template>
  <b-container>
    <h1>Home</h1>

    <b-list-group class="mt-3">
      <b-list-group-item 
        v-for="experiment in experiments.rows"
        v-bind:key="experiment.doc._id"
        :href="'#/experiment/' + experiment.doc._id"
        class="d-flex justify-content-between align-items-center"
      >
        <div>
          {{ experiment.doc.name }} <b-badge :variant="experiment.doc.isLocal ? 'light' : 'dark'">
            {{ experiment.doc.isLocal ? "LOCAL" : "REMOTE" }}
          </b-badge>
        </div>
        <b-button variant="danger" @click="e => onClickDelete(e, experiment.doc)">
          <v-icon name="trash"/>
        </b-button>
      </b-list-group-item>
    </b-list-group>

    <b-pagination
      v-model="currentPage"
      :total-rows="experiments.total_rows"
      :per-page="limit"
      @change="onPageChange"
      size="md"
      class="mt-3"
      align="center"
    />

    <b-modal
      v-model="show"
      title="Supprimer"
      header-bg-variant="danger"
      header-text-variant="light"
      @ok="onConfirmDelete"
      ok-variant="danger"
      ok-title="Supprimer"
      size="lg"
    >
      <p class="my-4">Êtes-vous sur de vouloir supprimer cet experiment ?</p>
    </b-modal>
  </b-container>
</template>

<script>
export default {
  data() {
    return {
      currentPage: 1,
      limit: this.$db.getLimit(),
      show: false,
      doc: null
    }
  },
  subscriptions() {
    return {
      experiments: this.$db.fetchExperiments()
    }
  },
  methods: {
    onPageChange(page) {
      this.$db.fetchExperiments(page);
    },
    onClickDelete(e, doc) {
      e.preventDefault();
      if (doc) {
        this.doc = doc;
        this.show = true;
      }
    },
    async onConfirmDelete() {
      if (this.doc) {
        await this.$db.deleteExperiment(this.doc);
      }
      this.$db.fetchExperiments(this.currentPage);
      this.show = false;
    }
  }
};
</script>
