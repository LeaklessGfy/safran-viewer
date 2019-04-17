<template>
  <span class="d-inline-block">
    <b-button v-b-modal.measuresModal>
      <v-icon name="chart-line" /> Mesures
    </b-button>

    <b-modal
      id="measuresModal"
      title="Mesures"
      size="xl"
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
        v-model="measures.current"
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
    refId: {
      type: Number,
      required: true
    }
  },
  data() {
    return {
      tmpMeasures: []
    };
  },
  computed: {
    chart() {
      return this.$store.state.charts[this.refId].chart;
    },
    selectedMeasures() {
      return this.$store.state.charts[this.refId].selectedMeasures;
    }
  },
  subscriptions() {
    return {
      measures: this.$db.getMeasures()
    };
  },
  methods: {
    onShowMeasures() {
      if (this.measures.length < 1) {
        this.$db.fetchMeasures(this.$route.params.id);
      }
      this.tmpMeasures = Object.values(this.selectedMeasures);
    },
    onMeasurePageChange(page) {
      this.$db.fetchMeasures(this.$route.params.id, page);
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
          this.chart.addMeasure(tmp, samples);
        } else {
          selectedMeasures[tmp.id] = former[tmp.id];
          delete former[tmp.id];
        }
      }
      
      for (let remove of Object.values(former)) {
        this.chart.removeMeasure(remove);
      }

      this.$store.commit('updateChart', { refId: this.refId, selectedMeasures });
      this.$store.commit('updateTimelineValues', { refId: this.refId });
      this.$db.fetchModifications(this.$route.params.id);
    }
  }
};
</script>
