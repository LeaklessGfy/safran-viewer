<template>
  <div>
    <b-list-group>
      <b-list-group-item
        v-for="experiment in experiments"
        :key="experiment.id"
        class="d-flex justify-content-between align-items-center"
        button
        :active="selectedExperiment === experiment.id"
        @click="() => onClickExperiment(experiment.id)"
      >
        {{ experiment.name }}
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
  </div>
</template>

<script>
import { fetchExperiments } from '@/services/db/remote';

export default {
  props: {
    selectedExperiment: {
      type: String,
      required: false,
      default: null
    },
    onExperiment: {
      type: Function,
      required: true
    }
  },
  data() {
    return {
      experiments: [],
      currentPage: 1
    };
  },
  async mounted() {
    const experiments = await fetchExperiments(this.currentPage);
    this.experiments = experiments ? experiments : this.experiments;
    if (!this.selectedExperiment && this.experiments.length > 0) {
      this.onClickExperiment(this.experiments[0].id);
    }
  },
  methods: {
    onClickExperiment(id) {
      this.onExperiment(this.selectedExperiment === id ? null : id);
    },
    async onPageChange(page) {
      this.currentPage = page;
      this.experiments = await fetchExperiments(page);
    }
  }
};
</script>
