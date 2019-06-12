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
import Plugin from './Plugin';
import Chart from './plugins/Chart';
import Timeline from './plugins/Timeline';

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
      plugins: [
        {
          x: 0,
          y: 0,
          w: 5,
          h: 8,
          i: 0,
          static: true,
          experiment: '757d001a-9460-4beb-a43c-a352733ff89e',
          measures: [],
          component: 'chart'
        },
        {
          x: 5,
          y: 0,
          w: 5,
          h: 8,
          i: 1,
          static: true,
          experiment: '',
          measures: [],
          component: 'timeline'
        }
      ]
    };
  },
  methods: {
    addPlugin() {
      this.plugins.push({
        x: 0,
        y: 0,
        w: 2,
        h: 2,
        i: this.plugins.length,
        static: false,
        component: 'chart'
      });
    },
    togglePlugin(index) {
      this.plugins[index].static = !this.plugins[index].static;
    },
    removePlugin(index) {
      this.plugins.splice(index, 1);
    }
  }
};
</script>

<style>
body {
  background-color: #161719 !important;
  color: white !important;
}

.vue-grid-item>.vue-resizable-handle {
  background-color: grey;
}
</style>
