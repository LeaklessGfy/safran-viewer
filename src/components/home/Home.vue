<template>
  <b-container>
    <h1>Home</h1>

    <b-list-group class="mt-3">
      <b-list-group-item 
        v-for="experiment in experiments"
        :key="experiment.id"
        :href="'#/experiment/' + experiment.id"
        class="d-flex justify-content-between align-items-center"
      >
        <div>
          {{ experiment.name }}
        </div>
        <b-button
          variant="danger"
          @click="e => onClickDelete(e, experiment)"
        >
          <v-icon name="trash" />
        </b-button>
      </b-list-group-item>
    </b-list-group>

    <b-pagination
      v-model="currentPage"
      :total-rows="experiments.total"
      :per-page="experiments.limit"
      size="md"
      class="mt-3"
      align="center"
      @change="onPageChange"
    />

    <b-modal
      v-model="show"
      title="Supprimer"
      header-bg-variant="danger"
      header-text-variant="light"
      ok-variant="danger"
      ok-title="Supprimer"
      size="xl"
      @ok="onConfirmDelete"
    >
      <p class="my-4">
        Êtes-vous sur de vouloir supprimer cet experiment ?
      </p>
    </b-modal>
  </b-container>
</template>

<script>
import { fetchExperiments, removeExperiment } from '@/services/db/remote';

export default {
  name: 'Home',
  data() {
    return {
      experiments: [],
      currentPage: 1,
      show: false,
      del: null
    };
  },
  async mounted() {
    const experiments = await fetchExperiments(this.currentPage);
    this.experiments = experiments ? experiments : this.experiments;
  },
  methods: {
    async onPageChange(page) {
      this.experiments = await fetchExperiments(page);
      this.currentPage = page;
    },
    onClickDelete(e, del) {
      e.preventDefault();
      if (!del) return; 
      this.del = del;
      this.show = true;
    },
    async onConfirmDelete() {
      if (!this.del) return;
      await removeExperiment(this.del.id);
      this.experiments = await fetchExperiments(this.currentPage);
      this.del = null;
      this.show = false;
    }
  }
};
</script>
