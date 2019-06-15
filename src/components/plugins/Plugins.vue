<template>
  <b-container
    fluid
    style="height: 94%;"
  >
    <b-row class="h-100">
      <b-col
        md="2"
        class="h-100 theme-alt"
      >
        <h2>Options</h2>

        <p>Experiments</p>
        <experiments :on-experiment="onExperiment" />

        <p>Measures</p>
        <measures
          v-if="experiment"
          :experiment="experiment.id"
          :selected-measures="measures"
          :on-submit-measures="onMeasures"
        />
      </b-col>

      <b-col class="h-100">
        <h2>Plugins</h2>

        <div>
          <b-button
            squared
            :pressed="mode === 'chart'"
            variant="outline-warning"
            class="mr-2"
            @click="() => onMode('chart')"
          >
            Chart
          </b-button>

          <b-button
            squared
            :pressed="mode === 'timeline'"
            variant="outline-warning"
            class="mr-2"
            @click="() => onMode('timeline')"
          >
            Timeline
          </b-button>

          <b-button
            squared
            :pressed="mode === 'modification'"
            variant="outline-warning"
            class="mr-2"
            @click="() => onMode('modification')"
          >
            Modification
          </b-button>
        </div>

        <div
          v-if="experiment"
          class="mt-4"
          :style="mode === 'chart' ? 'height:40%;' : ''"
        >
          <plugin
            :plugin="plugin"
            :toggle-plugin="() => {}"
            :remove-plugin="() => {}"
          >
            <component
              :is="plugin.component"
              :key="experiment.id + measures.map(m => m.id)"
              :plugin="plugin"
            />
          </plugin>
        </div>

        <div>
          <b-button
            variant="success"
            class="position-fixed"
            style="bottom:20px;right:20px;"
            :disabled="!experiment"
            @click="onSave"
          >
            Save
          </b-button>
        </div>
      </b-col>
    </b-row>
  </b-container>
</template>

<script>
import Experiments from '../shared/Experiments';
import Measures from '../shared/Measures';
import Plugin from '../shared/Plugin';
import Chart from '../shared/plugins/Chart';
import Timeline from '../shared/plugins/Timeline';
import Modification from '../shared/plugins/Modification';

export default {
  name: 'Plugins',
  components: {
    experiments: Experiments,
    measures: Measures,
    plugin: Plugin,
    chart: Chart,
    timeline: Timeline,
    modification: Modification
  },
  data() {
    return {
      mode: 'chart',
      experiment: null,
      measures: []
    };
  },
  computed: {
    plugin() {
      return {
        x: 0,
        y: 0,
        w: 5,
        h: 8,
        experiment: this.experiment.id,
        measures: this.measures.map(m => m.id),
        component: this.mode
      };
    }
  },
  mounted() {
    if (this.$route.params.id) {
      this.$db.fetchPlugin(this.$route.params.id)
      .then(p => console.log(p));
    }
  },
  methods: {
    onMode(mode) {
      this.mode = mode;
    },
    onExperiment(experiment) {
      this.experiment = experiment;
    },
    onMeasures(measures) {
      this.measures = measures;
    },
    onSave() {
      if (!this.experiment) {
        return;
      }
      this.$db.insertPlugin(this.plugin)
      .then(plugin => console.log(plugin));
    }
  }
};
</script>

<style scoped>
h2 {
  font-size: 1.3em;
  margin-top: 10px;
}
</style>

