<template>
  <b-container>
    <h1>Home</h1>

    <b-list-group class="mt-3">
      <b-list-group-item 
        v-for="experiment in experiments"
        v-bind:key="experiment.id"
        :href="'#/experiment/' + experiment.id"
        class="d-flex justify-content-between align-items-center"
      >
        <div>
          {{ experiment.name }} <b-badge :variant="experiment.isLocal ? 'light' : 'dark'">
            {{ experiment.isLocal ? "LOCAL" : "REMOTE" }}
          </b-badge>
        </div>
        <b-button variant="danger" @click="e => onClickDelete(e, experiment)">
          <v-icon name="trash"/>
        </b-button>
      </b-list-group-item>
    </b-list-group>

    <b-pagination
      v-model="experiments.current"
      :total-rows="experiments.total"
      :per-page="experiments.limit"
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
      size="xl"
    >
      <p class="my-4">Êtes-vous sur de vouloir supprimer cet experiment ?</p>
    </b-modal>
  </b-container>
</template>

<script>
export default {
  data() {
    return {
      show: false,
      experiment: null
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
    onClickDelete(e, experiment) {
      e.preventDefault();
      if (experiment) {
        this.experiment = experiment;
        this.show = true;
      }
    },
    async onConfirmDelete() {
      if (this.experiment) {
        await this.$db.removeExperiment(this.experiment.id);
      }
      this.$db.fetchExperiments(this.experiments.current);
      this.show = false;
    }
  }
};
</script>
