<template>
  <div>
    <b-list-group>
      <b-list-group-item
        v-for="experiment in experiments"
        :key="experiment.id"
        variant="dark"
        class="d-flex justify-content-between align-items-center"
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
      experiments: []
    };
  },
  methods: {
    onPageChange(page) {
      this.currentPage = page;
    }
  }
};
</script>
