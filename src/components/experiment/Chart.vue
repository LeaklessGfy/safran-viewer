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

    <b-tabs content-class="mt-3">
      <b-tab title="Lecture" active>
        <b-table striped hover :items="timelineValues" />
      </b-tab>
      <b-tab title="Modifications" @click="() => onClickMode('select')">
        <b-form @submit="onModificationSubmit" inline>
          <b-form-select
            v-model="modification.measure"
            class="mr-2"
            :options="Object.values(selectedMeasures).map(m => m.id)"
            required
          />

          <cleave
            v-model="modification.startTime"
            :options="options"
            class="form-control mr-2"
            placeholder="hh:mm:ss,ssss"
            :raw="false"
            required
          />

          <b-form-select
            v-model="modification.operation"
            class="mr-2"
            :options="['ADD', 'CONSTANT']"
            required
          />

          <b-input v-model="modification.value" class="mr-2" type="number" />

          <cleave
            v-model="modification.endTime"
            :options="options"
            class="form-control mr-2"
            placeholder="hh:mm:ss,ssss"
            :raw="false"
            required
          />

          <b-button type="submit" variant="primary">Add</b-button>
        </b-form>

        <b-table striped hover :items="modifications" class="mt-2">
          <template slot="actions" slot-scope="scope">
            <b-button v-if="!scope.item.isApply" size="sm" variant="primary" @click="() => onToggleModification(scope, true)">
              Appliquer
            </b-button>
            <b-button v-else size="sm" variant="warning" @click="() => onToggleModification(scope, false)">
              Enlever
            </b-button>
            <b-button size="sm" variant="danger" class="ml-2">
              Supprimer
            </b-button>
          </template>
        </b-table>
      </b-tab>
    </b-tabs>

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
import { dateToTime, timeToTimestamp, timeToDate } from '../../services/date';

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
      selectedMeasures: {},
      timelineValues: [],
      /* MODIFICATION */
      modification: {
        measure: null,
        startTime: null,
        endTime: null,
        operation: 'ADD',
        value: 0,
        isApply: false,
        actions: null
      },
      modifications: [
        { measure: '', startTime: '', endTime: '', operation: 'ADD', value: 5, isApply: true, actions: null }
      ]
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
      onZoom: (startDate, endDate) => {
        this.startTime = dateToTime(startDate);
        this.endTime = dateToTime(endDate);
      },
      onDateClick: date => {
        this.currentTime = dateToTime(date);
        this.updateTimelineValues(date);
      },
      onSelect: (startDate, endDate) => {
        this.modification.startTime = dateToTime(startDate);
        this.modification.endTime = dateToTime(endDate);
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
    async onOkMeasure() {
      const former = Object.assign({}, this.selectedMeasures);
      this.selectedMeasures = {};
      for (let measure of this.tmpMeasures) {
        if (!former[measure.id]) {
          this.selectedMeasures[measure.id] = measure;
          const samples = await this.$db.fetchSamples(measure.id);
          this.chart.addMeasure(measure, samples);
        } else {
          this.selectedMeasures[measure.id] = former[measure.id];
          delete former[measure.id];
        }
      }
      for (let remove of Object.values(former)) {
        this.chart.removeMeasure(remove);
      }
      this.updateTimelineValues(timeToDate(this.currentTime, this.experiment.beginTime));
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
        this.updateTimelineValues(newDate);
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
    updateTimelineValues(date) {
      this.timelineValues = Object.values(this.selectedMeasures).map(measure => {
        const data = this.chart.getMeasureData(measure, date);
        return {
          measure: measure.name,
          type: measure.type,
          unit: measure.unit,
          value: data ? data.valueY : '-'
        };
      });
    },
    onModificationSubmit(e) {
      e.preventDefault();
      this.modifications.push({ ...this.modification });
    },
    onToggleModification(scope, state) {
      scope.item.isApply = state;
      const measure = { id: scope.item.measure };
      const startDate = timeToDate(scope.item.startTime, this.experiment.beginTime);
      const endDate = timeToDate(scope.item.endTime, this.experiment.endTime);

      if (state) {
        this.chart.addRange(measure, startDate, endDate);
      } else {
        this.chart.removeRange(measure);
      }
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
