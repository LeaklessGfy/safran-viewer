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

      <b-col cols="8">
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

        <b-button-group>
          <b-button variant="warning">
            <v-icon name="pause"/>
          </b-button>
          <b-button variant="primary">
            <v-icon name="play"/>
          </b-button>
          <b-button variant="danger">
            <v-icon name="stop"/>
          </b-button>
        </b-button-group>
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
        v-model="currentPage"
        :total-rows="measures.max"
        :per-page="limit"
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
import { dateToTime, timeToTimestamp, dateToTimestamp } from '../../services/date';

export default {
  data() {
    return {
      /* CHART */
      chart: null,
      mode: 'zoom',
      /* TIME */
      startTime: null,
      endTime: null,
      minDate: null,
      maxDate: null,
      options: {
        blocks: [2, 2, 2, 4],
        delimiters: [':', ':', '.'],
        numericOnly: true,
        numeralPositiveOnly: true,
        stripLeadingZeroes: false
      },
      /* MEASURE */
      currentPage: 1,
      limit: this.$db.getLimit(),
      tmpMeasures: [],
      selectedMeasures: {}
    }
  },
  props: {
    refName: String,
    experiment: Object
  },
  subscriptions() {
    return {
      measures: this.$db.getMeasures()
    }
  },
  mounted() {
    this.minDate = dateToTimestamp(this.experiment.beginTime);
    this.maxDate = dateToTimestamp(this.experiment.endTime);
    
    this.chart = new ChartService(this.$refs[this.refName], this.experiment.beginTime, this.experiment.endTime, {
      onScaleChange: (startDate, endDate) => {
        this.startTime = dateToTime(startDate);
        this.endTime = dateToTime(endDate);
      }
    });
    this.$db.fetchAlarms(this.experiment.id)
    .then(alarms => {
      this.chart.addAlarms(alarms);
    });
  },
  beforeDestroy() {
    this.chart.destroy();
  },
  methods: {
    onTimeChange(e) {
      if (!this.chart) {
        return;
      }
      if (e.keyCode === undefined || e.keyCode === 13) {
        let startDate = timeToTimestamp(this.startTime, this.experiment.beginTime);
        let endDate = timeToTimestamp(this.endTime, this.experiment.endTime);

        if (startDate < this.minDate) {
          startDate = this.minDate;
        } else if (startDate > this.maxDate) {
          startDate = this.maxDate;
        }
        if (endDate < this.minDate) {
          endDate = this.minDate;
        } else if (endDate > this.maxDate) {
          endDate = this.maxDate;
        }

        this.startTime = dateToTime(startDate);
        this.endTime = dateToTime(endDate);
        this.chart.zoom(startDate, endDate);
      }
    },
    onShowMeasures() {
      if (this.measures.length < 1) {
        this.$db.fetchMeasures(this.$route.params.id, this.currentPage);
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
