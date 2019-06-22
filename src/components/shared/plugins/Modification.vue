<template>
  <div class="">
    <b-form
      class="justify-content-center mb-5"
      inline
      @submit="addModification"
    >
      <b-form-select
        v-model="modification.measure"
        :options="samples.map(s => s.measure.id)"
        required
        class="mr-2"
      />

      <b-form-select
        v-model="modification.operation"
        :options="['ADD', 'CONSTANT']"
        required
        class="mr-2"
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

    <div class="px-5 mb-4">
      <div ref="slider" />
    </div>

    <b-table
      striped
      dark
      hover
      :fields="fields"
      :items="modifications"
      class="mt-5"
    >
      <template
        slot="actions"
        slot-scope="scope"
      >
        <b-button
          v-if="!scope.item.isApply"
          size="sm"
          variant="primary"
          @click="() => toggleModification(scope.item)"
        >
          Appliquer
        </b-button>
        <b-button
          v-else
          size="sm"
          variant="warning"
          @click="() => toggleModification(scope.item)"
        >
          Enlever
        </b-button>
        <b-button
          size="sm"
          variant="danger"
          class="ml-2"
          @click="() => removeModification(scope.item)"
        >
          Supprimer
        </b-button>
      </template>
    </b-table>
  </div>
</template>

<script>
import * as noUiSlider from 'nouislider';
import { fetchModifications, insertModification, removeModification } from '@/plugins/db/dblocal';
import { dateToTime, timeToDate } from '@/services/date';

export default {
  name: 'Modification',
  props: {
    experiment: {
      type: Object,
      required: true
    },
    samples: {
      type: Array,
      required: false,
      default: () => []
    }
  },
  data() {
    return {
      currentSample: null,
      start: null,
      end: null,
      modification: {
        experiment: null,
        measure: null,
        operation: 'ADD',
        value: 0
      },
      modifications: [],
      fields: [
        'measure',
        { key: 'startDate', formatter: dateToTime },
        { key: 'endDate', formatter: dateToTime },
        'operation',
        'value',
        'actions'
      ]
    };
  },
  watch: {
    'modification.measure': function (newId) {
      const full = this.samples.find(s => s.measure.id === newId);
      const s = full.samples;

      if (s.length > 0) {
        this.start = s[0].time.getTime();
        this.end = s[s.length - 1].time.getTime();
      }

      this.$refs.slider.noUiSlider.set([this.start, this.end]);
    }
  },
  async mounted() {
    const date = new Date(this.experiment.startDate);
    this.start = date.getTime();
    this.end = new Date(this.experiment.endDate).getTime();
    this.modification.experiment = this.experiment.id;

    if (this.samples.length > 0) {
      this.modification.measure = this.samples[0].measure.id;
    }

    noUiSlider.create(this.$refs.slider, {
      start: [this.start, this.end],
      margin: 5000,
      behaviour: 'drag-tap',
      connect: true,
      tooltips: true,
      format: {
        to: timestamp => dateToTime(new Date(timestamp)),
        from: value => value
      },
      range: {
        min: this.start,
        max: this.end
      },
      pips: {
        mode: 'steps',
        density: 3,
        format: {
          to: timestamp => dateToTime(new Date(timestamp)),
          from: value => value
        }
      }
    });

    this.$refs.slider.noUiSlider.on('change', values => {
      this.start = timeToDate(values[0], date).getTime();
      this.end = timeToDate(values[1], date).getTime();
    });

    const modifications = await fetchModifications(this.experiment.id);
    this.modifications = modifications ? modifications : this.modifications;
  },
  methods: {
    async addModification(e) {
      e.preventDefault();
      await insertModification({ ...this.modification, startDate: this.start, endDate: this.end });
      this.$notify({
        type: 'success',
        text: 'Modification enregistrée'
      });
      this.modifications = await fetchModifications(this.experiment.id);
    },
    toggleModification(modification) {
      this.$store.commit('TOGGLE_MODIFICATION', modification);
    },
    async removeModification(modification) {
      await removeModification(modification);
      this.$notify({
        type: 'success',
        text: 'Modification supprimée'
      });
      this.modifications = await fetchModifications(this.experiment.id);
    }
  }
};
</script>
