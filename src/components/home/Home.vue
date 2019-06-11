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
export default {
  name: 'Home',
  data() {
    return {
      currentPage: 1,
      show: false,
      del: null
    };
  },
  computed: {
    experiments() {
      return this.$store.state.experiments;
    }
  },
  mounted() {
    this.$store.dispatch('fetchExperiments');
  },
  methods: {
    onPageChange(page) {
      this.$store.dispatch('fetchExperiments', page);
      this.currentPage = page;
    },
    onClickDelete(e, del) {
      e.preventDefault();
      if (del) {
        this.del = del;
        this.show = true;
      }
    },
    async onConfirmDelete() {
      if (this.del) {
        await this.$db.removeExperiment(this.del.id);
      }
      this.$store.dispatch('fetchExperiments', this.experiments.current);
      this.show = false;
      this.del = null;
    }
  }
};
</script>
