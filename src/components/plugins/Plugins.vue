<template>
  <b-container
    fluid
    style="height: 94%;"
  >
    <b-row class="h-100">
      <b-col
        md="3"
        class="sidebar"
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

      <b-col>
        <h2>Plugins</h2>

        <b-card-group>
          <b-card
            title="Chart"
            bg-variant="dark"
          />
          <b-card
            title="Timeline"
            bg-variant="dark"
          />
          <b-card
            title="Modifications"
            bg-variant="dark"
          />
        </b-card-group>
      </b-col>
    </b-row>
  </b-container>
</template>

<script>
import Experiments from '../shared/Experiments';
import Measures from '../shared/Measures';

export default {
  name: 'Plugins',
  components: {
    experiments: Experiments,
    measures: Measures
  },
  data() {
    return {
      experiment: null,
      measures: []
    };
  },
  methods: {
    onExperiment(experiment) {
      this.experiment = experiment;
    },
    onMeasures(measures) {
      this.measures = measures;
    }
  }
};
</script>

<style>
.sidebar {
  height: 100%;
  background: white;
  color: black;
}
</style>

