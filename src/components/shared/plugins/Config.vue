<template>
  <b-modal
    id="plugin-config"
    title="Config"
    size="xl"
    :cancel-disabled="false"
  >
    <b-form-group label="Essai">
      <experiments
        :selected-experiment="plugin.experiment"
        :on-experiment="onExperiment"
      />
    </b-form-group>

    <b-form-group label="Mesures">
      <measures
        :key="plugin.experiment"
        :experiment="plugin.experiment"
        :selected-measures="plugin.measures"
        :on-add-measure="onAddMeasure"
        :on-remove-measure="onRemoveMeasure"
      />
    </b-form-group>

    <b-form-group>
      <b-button
        v-b-toggle.json
        variant="primary"
      >
        JSON
      </b-button>
      <b-collapse id="json">
        <b-card>
          <b-textarea
            v-model="json"
            size="lg"
            rows="6"
            @blur="onBlur"
          />
        </b-card>
      </b-collapse>
    </b-form-group>
  </b-modal>  
</template>

<script>
import Experiments from '../Experiments';
import Measures from '../Measures';

export default {
  name: 'Config',
  components: {
    experiments: Experiments,
    measures: Measures
  },
  props: {
    plugin: {
      type: Object,
      required: true
    },
    onEdit: {
      type: Function,
      required: true
    }
  },
  data() {
    return {
      json: ''
    };
  },
  watch: {
    plugin() {
      this.json = JSON.stringify({ experiment: this.plugin.experiment, measures: this.plugin.measures }, undefined, 2);
    }
  },
  methods: {
    onExperiment(experiment) {
      this.onEdit({
        ...this.plugin,
        experiment: experiment
      });
    },
    onAddMeasure(measure) {
      this.onEdit({
        ...this.plugin,
        measures: this.plugin.measures.concat(measure)
      });
    },
    onRemoveMeasure(measure) {
      this.onEdit({
        ...this.plugin,
        measures: this.plugin.measures.filter(m => m !== measure)
      });
    },
    onBlur() {
      const plugin = JSON.parse(this.json);
      this.onEdit({
        ...this.plugin,
        ...plugin
      });
    }
  }
};
</script>
