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
          :vertical-compact="true"
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
                :plugin="plugin"
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
import Plugin from '../shared/Plugin';
import Chart from '../shared/plugins/Chart';
import Timeline from '../shared/plugins/Timeline';
import { fetchPlugins, updatePlugin } from '@/plugins/db/dblocal';

export default {
  name: 'Dashboard',
  components: {
    GridLayout: VueGridLayout.GridLayout,
    GridItem: VueGridLayout.GridItem,
    plugin: Plugin,
    chart: Chart,
    timeline: Timeline
  },
  data() {
    return {
      plugins: []
    };
  },
  async mounted() {
    this.plugins = await fetchPlugins();
  },
  methods: {
    togglePlugin(index) {
      this.plugins[index].static = !this.plugins[index].static;
    },
    removePlugin(index) {
      this.plugins.splice(index, 1);
    },
    async updatePlugin(index) {
      updatePlugin(this.plugins[index]);
    }
  }
};
</script>

<style>
.vue-grid-item>.vue-resizable-handle {
  background-color: grey;
}
</style>
