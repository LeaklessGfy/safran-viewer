<template>
  <div>
    <b-row>
      <b-col>
        <cleave
          v-model="startTime"
          :options="options"
          class="form-control mt-2"
          placeholder="hh:mm:ss,ssss"
          :raw="false"
          @blur.native="onTimeChange"
          @keyup.native="onTimeChange"
        />
      </b-col>

      <b-col cols="4">
        <b-button v-b-modal.measuresModal>
          <v-icon name="chart-line"/> Mesures
        </b-button>
        
        <b-dropdown variant="link" size="lg" no-caret>
          <template slot="button-content">
            <b-button>
              <v-icon :name="icon"/> Mode
            </b-button>
          </template>

          <b-dropdown-item @click="() => onClickMode('zoom')">
            Zoom
          </b-dropdown-item>
          <b-dropdown-item @click="() => onClickMode('select')">
            Select
          </b-dropdown-item>
          <b-dropdown-item @click="() => onClickMode('move')">
            Move
          </b-dropdown-item>
        </b-dropdown>

        <b-button-group class="float-right mt-2">
          <b-button variant="warning" :disabled="state !== 1" @click="() => onClickTimeline(2)">
            <v-icon name="pause"/>
          </b-button>
          <b-button variant="primary" :disabled="state === 1" @click="() => onClickTimeline(1)">
            <v-icon name="play"/>
          </b-button>
          <b-button variant="danger" :disabled="state === 0" @click="() => onClickTimeline(0)">
            <v-icon name="stop"/>
          </b-button>
        </b-button-group>
      </b-col>

      <b-col cols="4">
        <cleave
          v-model="currentTime"
          :options="options"
          class="form-control mt-2"
          placeholder="hh:mm:ss,ssss"
          :raw="false"
          :disabled="state === 1"
          @blur.native="onTimeChange"
          @keyup.native="onTimeChange"
        />
      </b-col>

      <b-col>
        <cleave
          v-model="endTime"
          :options="options"
          class="form-control mt-2"
          placeholder="hh:mm:ss,ssss"
          :raw="false"
          @blur.native="onTimeChange"
          @keyup.native="onTimeChange"
        />
      </b-col>
    </b-row>
    
    <div class="chart" :ref="refName"/>

    <b-modal id="measuresModal" title="Mesures" @show="onShowMeasures" @ok="onOkMeasure" size="xl">
      <b-list-group>
        <b-list-group-item
          v-for="measure in measures"
          v-bind:key="measure.id"
          class="d-flex justify-content-between align-items-center"
        >
          {{ measure.name + (measure.unit ? ' - ' + measure.unit : '') }}
          <b-button
            v-if="!tmpMeasures.some(m => m.id === measure.id)"
            @click="() => onClickAddMeasure(measure)"
            variant="outline-success"
          >
            Ajouter
          </b-button>
          <b-button
            v-else
            @click="() => onClickRemoveMeasure(measure)"
            variant="outline-danger"
          >
            Retirer
          </b-button>
        </b-list-group-item>
      </b-list-group>

      <b-pagination
        v-model="measures.current"
        :total-rows="measures.total"
        :per-page="measures.limit"
        @change="onMeasurePageChange"
        size="md"
        class="mt-3"
        align="center"
      />
    </b-modal>
  </div>
</template>

<script>
import ChartService from '../../services/chart';
import { dateToTime, timeToTimestamp } from '../../services/date';

export default {
  data() {
    return {
      /* CHART */
      chart: null,
      mode: 'zoom',
      sub: null,
      state: 0,
      interval: null,
      /* TIME */
      startTime: null,
      endTime: null,
      currentTime: null,
      options: {
        blocks: [2, 2, 2, 4],
        delimiters: [':', ':', '.'],
        numericOnly: true,
        numeralPositiveOnly: true,
        stripLeadingZeroes: false
      },
      /* MEASURE */
      tmpMeasures: [],
      selectedMeasures: {}
    }
  },
  props: {
    refName: String
  },
  subscriptions() {
    return {
      experiment: this.$db.getExperiment(),
      measures: this.$db.getMeasures()
    }
  },
  mounted() {
    this.currentTime = dateToTime(this.experiment.beginTime);
    this.chart = new ChartService(this.$refs[this.refName], this.experiment.beginTime, this.experiment.endTime, {
      onScaleChange: (startDate, endDate) => {
        this.startTime = dateToTime(startDate);
        this.endTime = dateToTime(endDate);
      },
      onDateClick: date => {
        this.currentTime = dateToTime(date);
      }
    });
    this.$db.fetchAlarms(this.experiment.id)
    .then(alarms => {
      this.chart.addAlarms(alarms);
    });

    this.sub = this.$db.getExperiment().subscribe(experiment => {
      this.chart.rescale(experiment.beginTime, experiment.endTime);
    });
  },
  beforeDestroy() {
    this.chart.destroy();
    this.sub.unsubscribe();
  },
  methods: {
    onTimeChange(e) {
      if (!this.chart) {
        return;
      }
      if (e.keyCode === undefined || e.keyCode === 13) {
        let startDate = timeToTimestamp(this.startTime, this.experiment.beginTime);
        let endDate = timeToTimestamp(this.endTime, this.experiment.endTime);
        let currentDate = timeToTimestamp(this.currentTime, this.experiment.beginTime);
        startDate = this.validateDate(startDate);
        endDate = this.validateDate(endDate);
        currentDate = this.validateDate(currentDate);
        
        this.startTime = dateToTime(startDate);
        this.endTime = dateToTime(endDate);
        this.currentTime = dateToTime(currentDate);
        this.chart.zoom(startDate, endDate);
      }
    },
    onShowMeasures() {
      if (this.measures.length < 1) {
        this.$db.fetchMeasures(this.$route.params.id);
      }
    },
    onMeasurePageChange(page) {
      this.$db.fetchMeasures(this.$route.params.id, page);
    },
    onClickAddMeasure(measure) {
      this.tmpMeasures.push(measure);
    },
    onClickRemoveMeasure(measure) {
      this.tmpMeasures = this.tmpMeasures.filter(m => m.id !== measure.id);
    },
    onOkMeasure() {
      const former = Object.assign({}, this.selectedMeasures);
      this.selectedMeasures = {};
      for (let measure of this.tmpMeasures) {
        if (!former[measure.id]) {
          this.$db.fetchSamples(measure.id)
          .then(samples => {
            this.chart.addMeasure(measure, samples);
          });
          this.selectedMeasures[measure.id] = measure;
        } else {
          this.selectedMeasures[measure.id] = former[measure.id];
          delete former[measure.id];
        }
      }
      for (let remove of Object.values(former)) {
        this.chart.removeMeasure(remove);
      }
    },
    onClickMode(mode) {
      this.mode = mode;
      this.chart.changeMode(mode);
    },
    onClickTimeline(state) {
      this.state = state;

      switch (state) {
        case 0:
          this.stopTimeline();
          break;
        case 1:
          this.startTimeline();
          break;
        case 2:
          this.pauseTimeline();
          break;
      }
    },
    startTimeline() {
      if (!this.currentTime) {
        return;
      }

      const speed = 100;
      const currentDate = timeToTimestamp(this.currentTime, this.experiment.beginTime);
      this.chart.startTimeline(currentDate);

      this.interval = setInterval(() => {
        const newDate = this.chart.tickTimeline(speed);
        this.currentTime = dateToTime(newDate);
        if (newDate.getTime() >= this.experiment.endTime) {
          clearInterval(this.interval);
          this.chart.stopTimeline();
        }
      }, speed);
    },
    pauseTimeline() {
      clearInterval(this.interval);
      this.chart.pauseTimeline();
    },
    stopTimeline() {
      clearInterval(this.interval);
      this.chart.stopTimeline();
      this.currentTime = dateToTime(this.experiment.beginTime);
    },
    validateDate(date) {
      if (date < this.experiment.beginTime) {
        return this.experiment.beginTime;
      } else if (date > this.experiment.endTime) {
        return this.experiment.endTime;
      }
      return date;
    }
  },
  computed: {
    icon() {
      switch (this.mode) {
        case 'zoom':
          return 'search-plus';
        case 'select':
          return 'object-ungroup';
        case 'move':
          return 'hand-paper';
        default:
          return 'search';
      }
    }
  }
};
</script>

<style>
.chart {
  width: 100%;
  height: 500px;
}
</style>
