<template>
  <b-container fluid>
    <b-row>
      <b-col>
        <b-card
          no-body
          bg-variant="dark"
          text-variant="white"
        >
          <b-tabs
            card
            class="dark"
            active-nav-item-class="text-dark"
          >
            <b-tab
              title="Plugins"
              active
              title-link-class="text-light"
            >
              <b-card-text>Tab Contents 1</b-card-text>

              <cleave
                v-model="currentDate"
                class="form-control mt-2"
                placeholder="hh:mm:ss:sss"
                :options="options"
                :raw="false"
                @blur.native="onTimeChange"
                @keyup.native="onTimeChange"
              />
            </b-tab>
          </b-tabs>
        </b-card>
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
              <template v-slot:default="slotProps">
                <component
                  :is="plugin.component"
                  :plugin="slotProps"
                />
              </template>
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
import { dateToTime } from '@/services/date';

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
        { x: 0, y: 0, w: 5, h: 8, i: 0, static: false, component: 'chart' },
        { x: 5, y: 0, w: 5, h: 8, i: 1, static: true, component: 'timeline' }
      ]
    };
  },
  computed: {
    options() {
      return this.$store.state.options;
    },
    currentDate: {
      get() {
        return dateToTime(this.$store.state.currentDate);
      },
      set() {
        //this.$store.dispatch(`${this.mod}/updateCurrentTime`, currentTime);
      }
    }
  },
  created() {
    this.$store.dispatch('fetchExperiments');
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
    },
    onTimeChange() {
      /*
      if (e.keyCode === undefined || e.keyCode === 13) {
        let currentDate = timeToTimestamp(this.currentTime, this.experiment.startDate);
        currentDate = this.validateDate(currentDate);
        
        this.currentTime = dateToTime(currentDate);
        this.service.zoom(startDate, endDate);
      }*/
    }
  }
};
</script>

<style>
body {
  background-color: #161719 !important;
  color: white !important;
}

.vue-grid-item {
  border: 1px solid #343436;
  padding-top: 40px;
}

.vue-grid-item:hover {
  border-color: #969697;
}

.vue-grid-item>.vue-resizable-handle {
  background-color: grey;
}

.chart {
  width: 100%;
  height: 100%;
}
</style>
