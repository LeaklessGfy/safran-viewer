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
          {{ experiment.doc.name }} <b-badge variant="dark">{{ experiment.doc.is_local ? "LOCAL" : "REMOTE" }}</b-badge>
        </div>
        <b-button variant="danger" @click="e => onClickDelete(e, experiment.doc)">
          <v-icon name="trash"/>
        </b-button>
      </b-list-group-item>
    </b-list-group>

    <b-pagination
      v-model="currentPage"
      :total-rows="totalPage"
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
import Db from '../../services/db';

export default {
  data() {
    return {
      currentPage: 1,
      totalPage: 1,
      limit: 2,
      show: false,
      doc: null
    }
  },
  subscriptions() {
    const sub = Db.fetchExperiments({ limit: this.limit });

    sub.subscribe(r => {
      if (!r.rows) return;
      this.totalPage = r.total_rows;
    });

    return {
      experiments: sub
    }
  },
  methods: {
    onPageChange(page) {
      Db.fetchExperiments({ limit: this.limit, skip: this.limit * (page - 1) });
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
        await Db.deleteExperiment(this.doc);
      }
      Db.fetchExperiments({ limit: this.limit, skip: this.limit * (this.currentPage - 1) })
      this.show = false;
    }
  }
};
</script>
