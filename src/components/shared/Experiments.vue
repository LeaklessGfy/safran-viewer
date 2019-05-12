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
        {{ experiment.name }} <b-badge :variant="experiment.isLocal ? 'light' : 'dark'">
          {{ experiment.isLocal ? "LOCAL" : "REMOTE" }}
        </b-badge>
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
export default {
  data() {
    return {
      currentPage: 1,
      active: -1
    };
  },
  computed: {
    experiments() {
      return this.$store.state.experiments;
    }
  },
  methods: {
    onClickExperiment(index) {
      if (this.active === index) {
        this.active = -1;
      } else {
        this.active = index;
      }
    },
    onPageChange(page) {
      this.currentPage = page;
      this.$store.dispatch('fetchExperiments', page);
    }
  }
};
</script>
