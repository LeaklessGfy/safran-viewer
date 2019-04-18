<template>
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

    <cleave
      v-model="modification.startTime"
      :options="options"
      class="form-control mr-2"
      placeholder="hh:mm:ss,ssss"
      :raw="false"
      required
    />

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

    <cleave
      v-model="modification.endTime"
      :options="options"
      class="form-control mr-2"
      placeholder="hh:mm:ss,ssss"
      :raw="false"
      required
    />

    <b-button
      type="submit"
      variant="primary"
    >
      Ajouter
    </b-button>
  </b-form>
</template>

<script>
import { dateToTime } from '@/services/date';

export default {
  props: {
    mod: {
      type: String,
      required: true
    },
    experiment: {
      type: Object,
      required: true
    },
    service: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      modification: {
        experimentId: this.experiment.id,
        measure: null,
        startTime: null,
        endTime: null,
        operation: 'ADD',
        value: 0
      }
    };
  },
  computed: {
    options() {
      return this.$store.state.options;
    },
    measuresId() {
      return this.$store.getters[this.mod + '/measuresId'];
    }
  },
  mounted() {
    this.service.addOnSelectListener((startDate, endDate) => {
      this.modification.startTime = dateToTime(startDate);
      this.modification.endTime = dateToTime(endDate);
    });
  },
  methods: {
    onSubmitModification(e) {
      e.preventDefault();
      this.$store.dispatch(`${this.mod}/insertModification`, this.modification);
    }
  }
};
</script>
