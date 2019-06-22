<template>
  <b-container fluid>
    <b-row>
      <b-col>
        <h1>Dashboard</h1>
      </b-col>
    </b-row>

    <b-row>
      <b-col class="text-center">
        <player />
      </b-col>
      <b-col>
        <cleave
          v-model="currentTime"
          class="form-control mt-2"
          placeholder="hh:mm:ss:sss"
          :options="options"
          :raw="false"
          @blur.native="onTimeChange"
          @keyup.native="onTimeChange"
        />
      </b-col>
    </b-row>

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
                v-if="findExepriment(plugin.experiment)"
                ref="plugins"
                :key="findExepriment(plugin.experiment).id + findSamples(plugin.measures).length"
                :experiment="findExepriment(plugin.experiment)"
                :samples="findSamples(plugin.measures)"
                :alarms="findAlarms(plugin.experiement)"
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
import Player from './Player';
import plugins, { Plugin } from '../shared/plugins';
import { fetchPlugins, updatePlugin } from '@/plugins/db/dblocal';
import { dateToTime, timeToDate } from '@/services/date';

export default {
  name: 'Dashboard',
  components: {
    GridLayout: VueGridLayout.GridLayout,
    GridItem: VueGridLayout.GridItem,
    player: Player,
    plugin: Plugin,
    ...plugins
  },
  data() {
    return {
      plugins: [],
      currentTime: null
    };
  },
  computed: {
    findExepriment() {
      return id => this.$store.getters.oneExperimentSelector(id);
    },
    findSamples() {
      return ids => this.$store.getters.samplesSelector(ids);
    },
    findAlarms() {
      return id => this.$store.getters.oneAlarmsSelector(id);
    },
    currentDate() {
      return this.$store.state.currentDate;
    },
    options() {
      return this.$store.state.options;
    }
  },
  watch: {
    currentDate(currentDate) {
      this.currentTime = dateToTime(currentDate);
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

    this.currentTime = dateToTime(this.currentDate);
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
      if (this.$refs.plugins[index] && this.$refs.plugins[index].onUpdate) {
        this.$refs.plugins[index].onUpdate();
      }
    },
    onTimeChange(e) {
      if (e.keyCode !== undefined && e.keyCode !== 13) {
        return;
      }
      const date = timeToDate(this.currentTime, this.currentDate);
      this.$store.commit('SET_CURRENT_DATE', date);
    }
  }
};
</script>

<style>
.vue-grid-item>.vue-resizable-handle {
  background-color: grey;
}
</style>
