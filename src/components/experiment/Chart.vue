<template>
  <div>
    <b-row>
      <b-col>
        <cleave
          v-model="startTime"
          :options="options"
          class="form-control"
          placeholder="hh:mm:ss,ssss"
          :raw="false"
          @blur.native="onTimeChangeEnd"
          @keyup.native="onTimeChangeEnd"
        />
      </b-col>
      <b-col>
        <b-button v-b-modal.measuresModal>
          <v-icon name="chart-line"/> Mesures
        </b-button>
      </b-col>
      <b-col>
        <cleave
          v-model="endTime"
          :options="options"
          class="form-control"
          placeholder="hh:mm:ss,ssss"
          :raw="false"
          @blur.native="onTimeChangeEnd"
        />
      </b-col>
    </b-row>
    
    <div class="chart" :ref="refName"/>

    <b-modal id="measuresModal" title="Mesures" @show="onMeasuresShow" @ok="onOk" size="lg">
      <b-list-group>
        <b-list-group-item
          v-for="measure in measures.rows"
          v-bind:key="measure.id"
          class="d-flex justify-content-between align-items-center"
        >
          {{ measure.value.name }} - {{ measure.value.unit }}
          <b-button
            v-if="!tmpMeasures.some(m => m.id === measure.id)"
            @click="() => onClickAdd(measure)"
            variant="outline-success"
          >
            Ajouter
          </b-button>
          <b-button
            v-else
            @click="() => onClickRemove(measure)"
            variant="outline-danger"
          >
            Retirer
          </b-button>
        </b-list-group-item>
      </b-list-group>

      <b-pagination
        v-model="currentPage"
        :total-rows="measures.total_rows"
        :per-page="limit"
        @change="onPageChange"
        size="md"
        class="mt-3"
        align="center"
      />
    </b-modal>
  </div>
</template>

<script>
import Chart from '../../services/chart';
import { dateToTime, stringToDate, timeToDate } from '../../services/date';

export default {
  data() {
    return {
      chart: null,
      startTime: null,
      endTime: null,
      currentPage: 1,
      limit: this.$db.getLimit(),
      options: {
        blocks: [2, 2, 2, 4],
        delimiters: [':', ':', '.'],
        numericOnly: true,
        numeralPositiveOnly: true,
        stripLeadingZeroes: false
      },
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
      measures: this.$db._measuresSubject
    }
  },
  mounted() {
    const startDate = stringToDate(this.experiment.beginTime);
    const endDate = stringToDate(this.experiment.endTime);

    this.startTime = dateToTime(startDate);
    this.endTime = dateToTime(endDate);

    this.chart = new Chart(this.$refs[this.refName], startDate, endDate, {
      onScaleChange: (startDate, endDate) => {
        this.startTime = dateToTime(startDate);
        this.endTime = dateToTime(endDate);
      }
    });
  },
  beforeDestroy() {
    this.chart.destroy();
  },
  methods: {
    onTimeChangeEnd(e) {
      if (!this.chart) {
        return;
      }
      if (e.keyCode === undefined || e.keyCode === 13) {
        const startDate = timeToDate(this.startTime, this.experiment.beginTime);
        const endDate = timeToDate(this.endTime, this.experiment.endTime);
        this.chart.zoom(startDate, endDate);
      }
    },
    onMeasuresShow() {
      if (this.measures.length < 1) {
        this.$db.fetchMeasures(this.$route.params.id, this.currentPage);
      }
    },
    onPageChange(page) {
      this.$db.fetchMeasures(this.$route.params.id, page);
    },
    onClickAdd(measure) {
      this.tmpMeasures.push(measure);
    },
    onClickRemove(measure) {
      this.tmpMeasures = this.tmpMeasures.filter(m => m.id !== measure.id);
    },
    onOk() {
      const former = Object.assign({}, this.selectedMeasures);
      this.selectedMeasures = {};
      for (let measure of this.tmpMeasures) {
        if (!former[measure.id]) {
          this.$db.fetchMeasure(measure.id)
          .then(measure => {
            this.chart.addMeasure(measure, measure.samples);
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
