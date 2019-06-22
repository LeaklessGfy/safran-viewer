<template>
  <div class="p-5">
    <b-form
      class="justify-content-center"
      inline
      @submit="onSubmitModification"
    >
      <b-form-select
        v-model="modification.measure"
        class="mr-2"
        :options="measuresId"
        required
      />

      <div ref="slider" />

      <b-form-select
        v-model="modification.operation"
        class="mr-2"
        :options="['ADD', 'CONSTANT']"
        required
      />

      <b-input
        v-model="modification.value"
        class="mr-2"
        type="number"
      />

      <b-button
        type="submit"
        variant="primary"
      >
        Ajouter
      </b-button>
    </b-form>
  </div>
</template>

<script>
import * as noUiSlider from 'nouislider';

export default {
  name: 'Modification',
  props: {
    experiment: {
      type: Object,
      required: true
    },
    measures: {
      type: Array,
      required: true
    }
  },
  data() {
    return {
      selectedMeasure: null,
      start: null,
      end: null
    };
  },
  mounted() {
    const min = this.experiment.startDate;
    const max = this.experiment.endDate;
    this.start = min;
    this.end = max;

    if (this.measures.length > 0) {
      this.selectedMeasure = this.measures[0];
    }

    noUiSlider.create(this.$refs.slider, {
      start: [this.start, this.end],
      margin: 10,
      behaviour: 'drag-tap',
      connect: true,
      tooltips: true,
      range: {
        min,
        max
      },
      pips: {
        mode: 'steps',
        density: 3
      }
    });

    //console.log(this.$refs.slider.noUiSlider.get());
  }
};
</script>
