<template>
  <span class="d-inline-block">
    <b-button v-b-modal.measuresModal>
      <v-icon name="chart-line" /> Mesures
    </b-button>

    <b-modal
      id="measuresModal"
      title="Mesures"
      size="xl"
      ok-title="Charger"
      cancel-title="Annuler"
      @show="onShowMeasures"
      @ok="onSubmitMeasure"
    >
      <b-list-group>
        <b-list-group-item
          v-for="measure in measures"
          :key="measure.id"
          class="d-flex justify-content-between align-items-center"
        >
          {{ measure.name + (measure.unit ? ' - ' + measure.unit : '') }}
          <b-button
            v-if="!tmpMeasures.some(m => m.id === measure.id)"
            variant="outline-success"
            @click="() => onClickAddMeasure(measure)"
          >
            Ajouter
          </b-button>
          <b-button
            v-else
            variant="outline-danger"
            @click="() => onClickRemoveMeasure(measure)"
          >
            Retirer
          </b-button>
        </b-list-group-item>
      </b-list-group>

      <b-pagination
        v-model="currentPage"
        :total-rows="measures.total"
        :per-page="measures.limit"
        size="md"
        class="mt-3"
        align="center"
        @change="onMeasurePageChange"
      />
    </b-modal>
  </span>
</template>

<script>
export default {
  props: {
    mod: {
      type: String,
      required: true
    },
    service: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      currentPage: 1,
      tmpMeasures: []
    };
  },
  computed: {
    experiment() {
      return this.$store.state[this.mod].experiment;
    },
    selectedMeasures() {
      return this.$store.state[this.mod].measures;
    },
    selectedMeasuresValues() {
      return this.$store.getters[this.mod + '/measures'];
    },
    measures() {
      return this.$store.state.measures;
    }
  },
  methods: {
    onShowMeasures() {
      this.$store.dispatch('fetchMeasures', { experimentId: this.experiment.id });
      this.tmpMeasures = Object.values(this.selectedMeasures);
    },
    onMeasurePageChange(page) {
      this.$store.dispatch('fetchMeasures', { experimentId: this.experiment.id, page });
      this.currentPage = page;
    },
    onClickAddMeasure(measure) {
      this.tmpMeasures.push(measure);
    },
    onClickRemoveMeasure(measure) {
      this.tmpMeasures = this.tmpMeasures.filter(m => m.id !== measure.id);
    },
    async onSubmitMeasure() {
      const former = Object.assign({}, this.selectedMeasures);
      const selectedMeasures = {};
      
      for (let tmp of this.tmpMeasures) {
        if (!former[tmp.id]) {
          selectedMeasures[tmp.id] = tmp;
          const samples = await this.$db.fetchSamples(tmp.id);
          this.service.addMeasure(tmp, samples);
        } else {
          selectedMeasures[tmp.id] = former[tmp.id];
          delete former[tmp.id];
        }
      }
      
      for (let remove of Object.values(former)) {
        this.service.removeMeasure(remove);
      }

      this.$store.dispatch(`${this.mod}/updateMeasures`, selectedMeasures);
      //this.$db.fetchModifications(this.experiment.id);
    }
  }
};
</script>
