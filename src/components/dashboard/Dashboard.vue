<template>
  <b-container fluid>
    <b-row>
      <b-col>
        <grid-layout
          :layout.sync="plugins"
          :col-num="12"
          :row-height="30"
          :is-draggable="true"
          :is-resizable="true"
          :is-mirrored="false"
          :vertical-compact="false"
          :margin="[10, 10]"
          :use-css-transforms="true"
        >
          <grid-item
            v-for="plugin in plugins"
            :key="plugin.i"
            :x="plugin.x"
            :y="plugin.y"
            :w="plugin.w"
            :h="plugin.h"
            :i="plugin.i"
            :static="plugin.static"
            @resized="updatePlugin"
            @moved="updatePlugin"
          >
            <plugin
              :plugin="plugin"
              :toggle-plugin="togglePlugin"
              :remove-plugin="removePlugin"
            >
              <component
                :is="plugin.component"
                v-if="experiments[plugin.experiment]"
                :key="experiments[plugin.experiment].id + findSamples(plugin.measures).join('')"
                :experiment="experiments[plugin.experiment]"
                :samples="findSamples(plugin.measures)"
                :alarms="alarms[plugin.alarms]"
              />
            </plugin>
          </grid-item>
        </grid-layout>
      </b-col>
    </b-row>
  </b-container>
</template>

<script>
import VueGridLayout from 'vue-grid-layout';
import plugins, { Plugin } from '../shared/plugins';
import { fetchPlugins, updatePlugin } from '@/plugins/db/dblocal';

export default {
  name: 'Dashboard',
  components: {
    GridLayout: VueGridLayout.GridLayout,
    GridItem: VueGridLayout.GridItem,
    plugin: Plugin,
    ...plugins
  },
  data() {
    return {
      plugins: []
    };
  },
  computed: {
    experiments() {
      return this.$store.state.experiments;
    },
    samples() {
      return this.$store.state.samples;
    },
    alarms() {
      return this.$store.state.alarms;
    },
    findSamples() {
      return ids => this.$store.getters.samplesSelector(ids);
    }
  },
  async mounted() {
    this.plugins = await fetchPlugins();
    const experiments = new Set();
    const measures = new Set();

    for (const plugin of this.plugins) {
      experiments.add(plugin.experiment);
      for (const measure of plugin.measures) {
        measures.add(measure);
      }
    }

    this.$store.dispatch('fetchExperiments', [...experiments]);
    this.$store.dispatch('fetchSamples', [...measures]);
    this.$store.dispatch('fetchAlarms', [...experiments]);
  },
  methods: {
    togglePlugin(index) {
      const plugin = this.plugins.find(plugin => plugin.i === index);
      if (plugin) {
        plugin.static = !plugin.static;
      }
    },
    removePlugin(index) {
      this.plugins = this.plugins.filter(plugin => plugin.i !== index);
    },
    async updatePlugin(index) {
      const realIndex = this.plugins.findIndex(plugin => plugin.i === index);
      if (realIndex > -1) {
        this.plugins[realIndex] = await updatePlugin(this.plugins[realIndex]);
      }
    }
  }
};
</script>

<style>
.vue-grid-item>.vue-resizable-handle {
  background-color: grey;
}
</style>
