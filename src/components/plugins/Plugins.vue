<template>
  <b-container
    fluid
    style="height: 94%;"
  >
    <b-row class="h-100">
      <b-col
        md="2"
        class="theme-alt"
        style="min-height:100%"
      >
        <h2>Options</h2>

        <b-form-group label="Nom">
          <b-form-input
            v-model="plugin.name"
            required
          />
        </b-form-group>

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
      </b-col>

      <b-col
        md="10"
        class="h-100"
      >
        <h2>Plugins</h2>

        <div>
          <b-button
            v-for="p in plugins"
            :key="p"
            squared
            variant="outline-warning"
            class="mr-2"
            :pressed="p === plugin.component"
            @click="() => onComponent(p)"
          >
            {{ p.charAt(0).toUpperCase() + p.slice(1) }}
          </b-button>
        </div>

        <plugin
          :plugin="plugin"
          class="mt-4"
          style="max-height:50%;"
        >
          <component
            :is="plugin.component"
            v-if="experiment"
            :key="experiment.id + samples.length"
            :experiment="experiment"
            :samples="samples"
            :alarms="alarms"
          />
        </plugin>

        <div>
          <b-button
            :variant="isEdit ? 'warning' : 'success'"
            class="position-fixed"
            style="bottom:20px;right:20px;"
            :disabled="!plugin.experiment"
            @click="onSave"
          >
            {{ isEdit ? 'Modifier' : 'Enregistrer' }}
          </b-button>
        </div>
      </b-col>
    </b-row>
  </b-container>
</template>

<script>
import Experiments from '../shared/Experiments';
import Measures from '../shared/Measures';
import plugins, { Plugin } from '../shared/plugins';

import { fetchPlugin, insertPlugin, updatePlugin } from '@/plugins/db/dblocal';

export default {
  name: 'Plugins',
  components: {
    experiments: Experiments,
    measures: Measures,
    plugin: Plugin,
    ...plugins
  },
  data() {
    return {
      plugins: Object.keys(plugins),
      plugin: {
        name: null,
        experiment: null,
        measures: [],
        component: 'highchart'
      }
    };
  },
  computed: {
    experiment() {
      return this.$store.getters.experimentSelector(this.plugin.experiment);
    },
    samples() {
      return this.$store.getters.samplesSelector(this.plugin.measures);
    },
    alarms() {
      return this.$store.getters.alarmsSelector(this.plugin.experiment);
    },
    isEdit() {
      return this.$route.params.id ? true : false;
    }
  },
  async mounted() {
    if (!this.isEdit) {
      return;
    }
    this.plugin = await fetchPlugin(this.$route.params.id);
  },
  methods: {
    onExperiment(experiment) {
      this.plugin.experiment = experiment;
      this.$store.dispatch('fetchExperiments', [experiment]);
      this.$store.dispatch('fetchAlarms', [experiment]);
    },
    onAddMeasure(measure) {
      this.plugin.measures.push(measure);
      this.$store.dispatch('fetchSamples', [measure]);
    },
    onRemoveMeasure(measure) {
      this.plugin.measures = this.plugin.measures.filter(m => m !== measure);
    },
    onComponent(component) {
      this.plugin.component = component;
    },
    async onSave() {
      if (!this.plugin.name || !this.plugin.experiment || !this.plugin.component) {
        this.$notify({
          type: 'warn',
          text: 'Veuillez remplir un nom et un essai'
        });
        return;
      }
      this.isEdit ? await updatePlugin(this.plugin) : await insertPlugin(this.plugin);
      this.$notify({
        type: 'success',
        title: 'Succès',
        text: `Le plugin à bien été ${this.isEdit ? 'édité' : 'enregistré'}`
      });
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

