<template>
  <div>
    <b-list-group>
      <b-list-group-item
        v-for="measure in measures"
        :key="measure.id"
        class="d-flex justify-content-between align-items-center text-dark"
      >
        {{ measure.name + (measure.unit ? ' - ' + measure.unit : '') }}
        <b-button
          v-if="!tmpMeasures.some(id => id === measure.id)"
          variant="outline-success"
          @click="() => addMeasure(measure)"
        >
          Ajouter
        </b-button>
        <b-button
          v-else
          variant="outline-danger"
          @click="() => removeMeasure(measure)"
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
      @change="onPageChange"
    />

    <div class="text-center">
      <b-button
        variant="outline-danger"
        class="mr-2"
        @click="onCancel"
      >
        Annuler
      </b-button>

      <b-button
        variant="outline-success"
        @click="onSave"
      >
        Enregistrer
      </b-button>
    </div>
  </div>
</template>

<script>
import { fetchMeasures } from '@/plugins/db/dbremote';

export default {
  props: {
    experiment: {
      type: String,
      required: false,
      default: null
    },
    selectedMeasures: {
      type: Array,
      required: true
    },
    onCancelMeasures: {
      type: Function,
      required: false,
      default: null
    },
    onSubmitMeasures: {
      type: Function,
      required: true
    }
  },
  data() {
    return {
      measures: [],
      tmpMeasures: [],
      currentPage: 1
    };
  },
  async mounted() {
    if (!this.experiment) {
      return;
    }
    this.tmpMeasures = this.selectedMeasures.slice();
    this.measures = await fetchMeasures(this.experiment, this.currentPage);
  },
  methods: {
    addMeasure(measure) {
      this.tmpMeasures.push(measure.id);
    },
    removeMeasure(measure) {
      this.tmpMeasures = this.tmpMeasures.filter(id => id !== measure.id);
    },
    async onPageChange(page) {
      this.currentPage = page;
      this.measures = await fetchMeasures(this.experiment, page);
    },
    onCancel() {
      this.tmpMeasures = this.selectedMeasures.slice();
      this.onCancelMeasures ? this.onCancelMeasures() : null;
    },
    onSave() {
      const newSelected = [];
      const formerSelected = this.selectedMeasures.slice();
      for (let tmp of this.tmpMeasures) {
        const index = formerSelected.findIndex(f => f === tmp);
        if (index !== -1) { // If was already selected delete of former to only keep one to remove
          formerSelected.splice(index, 1);
        }
        newSelected.push(tmp);
      }
      this.onSubmitMeasures(newSelected, formerSelected);
    }
  }
};
</script>
