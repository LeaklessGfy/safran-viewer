<template>
  <div class="w-100 h-100">
    <b-button
      size="sm"
      variant="outline-dark"
      class="position-fixed"
      style="top:0;left:0;"
    >
      Chart
    </b-button>
    <b-button-group
      class="position-fixed"
      style="top:0;right:0;"
    >
      <b-button
        size="sm"
        variant="outline-dark"
        @click="() => managePlugin()"
      >
        <v-icon name="cog" />
      </b-button>

      <b-button
        size="sm"
        variant="outline-dark"
        @click="() => togglePlugin(plugin.i)"
      >
        <v-icon :name="plugin.static ? 'lock' : 'unlock'" />
      </b-button>

      <b-button
        size="sm"
        variant="outline-dark"
        @click="() => removePlugin(plugin.i)"
      >
        <v-icon name="minus" />
      </b-button>
    </b-button-group>

    <div
      v-show="!manage && experiment"
      ref="chart"
      class="chart"
    />
    <div
      v-show="manage || !experiment"
      class="mb-4 px-4 pb-3 mw-100 mh-100"
      style="overflow-y:scroll;"
    >
      <b-form-group label="Essai">
        <b-form-select
          v-model="experiment"
          :options="experiments"
          @change="onExperiment"
        />
      </b-form-group>

      <b-form-group
        v-if="experiment"
        label="Mesures"
      >
        <measures
          :experiment="experiment.id"
          :selected-measures="selectedMeasures"
          :on-cancel-measures="onCancelMeasures"
          :on-submit-measures="onSubmitMeasures"
        />
      </b-form-group>
    </div>
  </div>
</template>

<script>
import ChartService from '@/services/chart';
import Measures from '@/components/shared/Measures';

export default {
  components: {
    measures: Measures
  },
  props: {
    plugin: {
      type: Object,
      required: true
    },
    togglePlugin: {
      type: Function,
      required: true
    },
    removePlugin: {
      type: Function,
      required: true
    }
  },
  data() {
    return {
      service: null,
      manage: true,
      experiment: null,
      selectedMeasures: []
    };
  },
  computed: {
    experiments() {
      return this.$store.state.experiments.map(experiment => ({
        value: experiment,
        text: experiment.reference + ' ' + experiment.name
      }));
    }
  },
  methods: {
    managePlugin() {
      if (!this.experiment) {
        return;
      }
      this.manage = !this.manage;
    },
    onExperiment() {
      if (this.service === null) {
        this.createService();
      } else {
        this.service.rescale(this.experiment.startDate, this.experiment.startDate, this.experiment.endDate);
      }
    },
    onCancelMeasures() {
      this.manage = false;
    },
    async onSubmitMeasures(selectedMeasures, removedMeasures) {
      if (this.service === null) {
        await this.createService();
      }

      for (let measure of selectedMeasures) {
        if (this.selectedMeasures.some(m => m.id === measure.id)) {
          continue;
        }
        const samples = await this.$db.fetchSamples(measure.id);
        this.service.addMeasure(measure, samples);
      }
      for (let measure of removedMeasures) {
        this.service.removeMeasure(measure);
      }

      this.selectedMeasures = selectedMeasures;
      this.manage = false;
    },
    async createService() {
      this.service = new ChartService(
        this.$refs.chart,
        this.experiment.startDate,
        this.experiment.startDate,
        this.experiment.endDate
      );
      this.service.addOnReadyListener(async () => {
        Promise.resolve();
      });
    }
  }
};
</script>
