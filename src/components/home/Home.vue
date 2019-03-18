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
        {{ experiment.doc.name }}
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

    <b-modal v-model="show" title="Supprimer" header-bg-variant="danger" header-text-variant="light" @ok="onConfirmDelete">
      <p class="my-4">Êtes-vous sur de vouloir supprimer cet experiment ?</p>

      <div slot="modal-footer" class="w-100">
        <div class="float-right">
        <b-button class="mr-2" @click="show=false">Cancel</b-button>
        <b-button variant="danger" @click="onConfirmDelete">Supprimer</b-button>
        </div>
      </div>
    </b-modal>
  </b-container>
</template>

<script>
import { fetchExperiments, deleteExperiment } from "../../services/db";

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
    const sub = fetchExperiments({ limit: this.limit });

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
      fetchExperiments({ limit: this.limit, skip: this.limit * (page - 1) });
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
        await deleteExperiment(this.doc);
      }
      fetchExperiments({ limit: this.limit, skip: this.limit * (this.currentPage - 1) })
      this.show = false;
    }
  }
}
</script>
