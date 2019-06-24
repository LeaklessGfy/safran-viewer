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
          v-if="!selectedMeasures.some(id => id === measure.id)"
          variant="outline-success"
          @click="() => addMeasure(measure)"
        >
          <v-icon name="plus" />
        </b-button>
        <b-button
          v-else
          variant="outline-danger"
          @click="() => removeMeasure(measure)"
        >
          <v-icon name="minus" />
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
  </div>
</template>

<script>
import { fetchMeasures } from '@/services/db/remote';

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
    onAddMeasure: {
      type: Function,
      required: false,
      default: () => {}
    },
    onRemoveMeasure: {
      type: Function,
      required: false,
      default: () => {}
    }
  },
  data() {
    return {
      measures: [],
      currentPage: 1
    };
  },
  async mounted() {
    if (!this.experiment) {
      return;
    }
    this.measures = await fetchMeasures(this.experiment, this.currentPage);
  },
  methods: {
    addMeasure(measure) {
      this.onAddMeasure(measure.id);
    },
    removeMeasure(measure) {
      this.onRemoveMeasure(measure.id);
    },
    async onPageChange(page) {
      this.currentPage = page;
      this.measures = await fetchMeasures(this.experiment, page);
    }
  }
};
</script>
