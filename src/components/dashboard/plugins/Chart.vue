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

    <div v-show="!ready">
      Chargement...
    </div>

    <div
      v-show="!manage && selectedExperiment"
      ref="chart"
      class="chart"
    />
    <div
      v-if="manage || !selectedExperiment"
      class="mb-4 px-2 mw-100 mh-100"
      style="overflow-y:scroll;"
    >
      <b-form-group label="Experiment">
        <b-form-select
          v-model="selectedExperiment"
          :options="experiments"
        />
      </b-form-group>

      <measures
        v-if="selectedExperiment"
        :experiment="selectedExperiment.id"
        :selected-measures="selectedMeasures"
        :on-cancel-measures="onCancelMeasures"
        :on-submit-measures="onSubmitMeasures"
      />
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
      ready: false,
      manage: false,
      experiments: [],
      selectedExperiment: null,
      selectedMeasures: []
    };
  },
  created() {
    this.$db.fetchExperiments()
    .then(experiments => {
      this.experiments = experiments.map(experiment => ({
        value: experiment,
        text: experiment.reference + ' ' + experiment.name
      }));
    });
  },
  mounted() {
    if (!this.selectedExperiment) {
      this.ready = true;
      this.manage = true;
    } else {
      this.createService();
    }
  },
  methods: {
    managePlugin() {
      if (this.manage && !this.selectedExperiment) {
        return;
      }
      this.manage = !this.manage;
      if (this.service === null) {
        this.createService();
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
      this.ready = false;
      this.service = new ChartService(
        this.$refs.chart,
        this.selectedExperiment.startDate,
        this.selectedExperiment.startDate,
        this.selectedExperiment.endDate
      );
      this.service.addOnReadyListener(async () => {
        this.ready = true;
        Promise.resolve();
      });
    }
  }
};
</script>
