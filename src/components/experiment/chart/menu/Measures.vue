<template>
  <span class="d-inline-block">
    <b-button v-b-modal.measuresModal>
      <v-icon name="chart-line"/> Mesures
    </b-button>

    <b-modal id="measuresModal" title="Mesures" @show="onShowMeasures" @ok="() => onOkMeasure(tmpMeasures)" size="xl">
      <b-list-group>
        <b-list-group-item
          v-for="measure in measures"
          v-bind:key="measure.id"
          class="d-flex justify-content-between align-items-center"
        >
          {{ measure.name + (measure.unit ? ' - ' + measure.unit : '') }}
          <b-button
            v-if="!tmpMeasures.some(m => m.id === measure.id)"
            @click="() => onClickAddMeasure(measure)"
            variant="outline-success"
          >
            Ajouter
          </b-button>
          <b-button
            v-else
            @click="() => onClickRemoveMeasure(measure)"
            variant="outline-danger"
          >
            Retirer
          </b-button>
        </b-list-group-item>
      </b-list-group>

      <b-pagination
        v-model="measures.current"
        :total-rows="measures.total"
        :per-page="measures.limit"
        @change="onMeasurePageChange"
        size="md"
        class="mt-3"
        align="center"
      />
    </b-modal>
  </span>
</template>

<script>
export default {
  props: {
    onOkMeasure: Function
  },
  data() {
    return {
      tmpMeasures: []
    };
  },
  subscriptions() {
    return {
      measures: this.$db.getMeasures()
    }
  },
  methods: {
    onShowMeasures() {
      if (this.measures.length < 1) {
        this.$db.fetchMeasures(this.$route.params.id);
      }
    },
    onMeasurePageChange(page) {
      this.$db.fetchMeasures(this.$route.params.id, page);
    },
    onClickAddMeasure(measure) {
      this.tmpMeasures.push(measure);
    },
    onClickRemoveMeasure(measure) {
      this.tmpMeasures = this.tmpMeasures.filter(m => m.id !== measure.id);
    }
  }
}
</script>
