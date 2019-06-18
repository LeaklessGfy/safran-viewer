<template>
  <div>
    <b-list-group>
      <b-list-group-item
        v-for="(experiment, index) in experiments"
        :key="experiment.id"
        class="d-flex justify-content-between align-items-center"
        button
        :active="index === active"
        @click="() => onClickExperiment(index)"
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
import { fetchExperiments } from '@/plugins/db/dbremote';

export default {
  props: {
    selectedExperiment: {
      type: String,
      required: false
    },
    onExperiment: {
      type: Function,
      required: true
    }
  },
  data() {
    return {
      experiments: [],
      currentPage: 1,
      active: -1
    };
  },
  async mounted() {
    this.experiments = await fetchExperiments(this.currentPage);
    if (this.selectedExperiment) {
      this.active = this.experiments.findIndex(e => e.id === this.selectedExperiment);
    }
  },
  methods: {
    onClickExperiment(index) {
      if (this.active === index) {
        this.active = -1;
        this.onExperiment(null);
      } else {
        this.active = index;
        this.onExperiment(this.experiments[index].id);
      }
    },
    async onPageChange(page) {
      this.currentPage = page;
      this.experiments = await fetchExperiments(page);
    }
  }
};
</script>
