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
              :copy="copy"
              :copy-plugin="copyPlugin"
              :edit-plugin="editPlugin"
              :lock-plugin="lockPlugin"
              :hide-plugin="hidePlugin"
            >
              <component
                :is="plugin.component"
                v-if="experiments[plugin.experiment]"
                ref="plugins"
                :key="plugin.experiment"
                :plugin="plugin"
              />
            </plugin>
          </grid-item>
        </grid-layout>
      </b-col>
    </b-row>

    <config
      :plugin="selectedPlugin"
      :on-edit="onEdit"
    />
  </b-container>
</template>

<script>
import VueGridLayout from 'vue-grid-layout';
import Player from './Player';
import plugins from '../shared/plugins';
import Config from '../shared/plugins/Config';
import { fetchPlugins, updatePlugin } from '@/services/db/local';
import { epochToTime, timeToEpoch } from '@/services/date';

export default {
  name: 'Dashboard',
  components: {
    GridLayout: VueGridLayout.GridLayout,
    GridItem: VueGridLayout.GridItem,
    player: Player,
    config: Config,
    ...plugins
  },
  data() {
    return {
      plugins: [],
      currentTime: null,
      selectedPlugin: {},
      copy: null
    };
  },
  computed: {
    experiments() {
      return this.$store.state.experiments;
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
      this.currentTime = epochToTime(currentDate);
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

    this.currentTime = epochToTime(this.currentDate);
    this.$store.dispatch('fetchExperiments', [...experiments]);
    this.$store.dispatch('fetchSamples', [...measures]);
    this.$store.dispatch('fetchAlarms', [...experiments]);
  },
  methods: {
    copyPlugin(index) {
      const plugin = this.plugins.find(plugin => plugin.i === index);
      if (!plugin) {
        return;
      }
      if (this.copy === null) {
        this.copy = plugin;
      } else {
        plugin.experiment = this.copy.experiment;
        plugin.measures = this.copy.measures.slice();
        this.copy = null;
      }
    },
    editPlugin(index) {
      const plugin = this.plugins.find(plugin => plugin.i === index);
      if (plugin) {
        this.selectedPlugin = plugin;
        this.$bvModal.show('plugin-config');
      }
    },
    lockPlugin(index) {
      const plugin = this.plugins.find(plugin => plugin.i === index);
      if (plugin) {
        plugin.static = !plugin.static;
      }
    },
    hidePlugin(index) {
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
      const date = timeToEpoch(this.currentTime, this.currentDate);
      this.$store.commit('SET_CURRENT_DATE', date);
    },
    async onEdit(plugin) {
      const realIndex = this.plugins.findIndex(p => p.i === plugin.i);
      const saved = await updatePlugin(plugin);
      this.selectedPlugin = saved;
      this.plugins[realIndex] = saved;
      this.$notify({
        type: 'success',
        text: 'Le plugin a été correctement mis à jour'
      });
      this.$store.dispatch('fetchExperiments', [saved.experiment]);
      this.$store.dispatch('fetchSamples', saved.measures);
      this.$store.dispatch('fetchAlarms', [saved.experiment]);
    }
  }
};
</script>

<style>
.vue-grid-item>.vue-resizable-handle {
  background-color: grey;
}
</style>
