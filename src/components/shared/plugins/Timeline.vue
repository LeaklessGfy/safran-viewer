<template>
  <b-table
    striped
    dark
    hover
    class="m-0"
    :items="timeline"
  />
</template>

<script>
import { differenceInSeconds } from 'date-fns';

export default {
  props: {
    plugin: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      timeline: []
    };
  },
  computed: {
    currentDate() {
      return this.$store.state.currentDate;
    },
    measures() {
      return this.$store.getters.measuresSelector(this.plugin.measures);
    },
    samples() {
      return this.$store.getters.samplesSelector(this.plugin.measures);
    }
  },
  watch: {
    currentDate(newDate) {
      this.updateTimeline(newDate);
    }
  },
  async mounted() {
    await this.$store.dispatch('fetchExperiment', this.plugin.experiment);
    await this.$store.dispatch('fetchMeasures', this.plugin.measures);
    await this.$store.dispatch('fetchSamples', this.plugin.measures);

    this.updateTimeline(new Date('2019-01-21T15:32:47'));
  },
  methods: {
    findASC(samples, date) {
      let bestDiff = Infinity;
      let bestSample = null;
      for (const sample of samples) {
        const diff = Math.abs(sample.time - date);
        if (diff < bestDiff) {
          bestDiff = diff;
          bestSample = sample;
        } else if (diff > bestDiff) {
          break;
        }
      }
      return bestSample;
    },
    findDESC(samples, date) {
      let bestDiff = Infinity;
      let bestSample = null;
      for (let i = samples.length - 1; i > -1; i--) {
        const sample = samples[i];
        const diff = Math.abs(sample.time - date);
        if (diff < bestDiff) {
          bestDiff = diff;
          bestSample = sample;
        } else if (diff > bestDiff) {
          break;
        }
      }
      return bestSample;
    },
    findNearest(samples, date) {
      if (samples.length < 1) {
        return null;
      }

      let bestSample = null;
      const firstSample = samples[0];
      const lastSample = samples[samples.length - 1];

      if (Math.abs(firstSample.time - date) < Math.abs(lastSample.time - date)) {
        bestSample = this.findASC(samples, date);
      } else {
        bestSample = this.findDESC(samples, date);
      }

      if (!bestSample) {
        return null;
      }

      const diffSeconds = Math.abs(differenceInSeconds(bestSample.time, date));
      if (diffSeconds > 1) {
        return null;
      }
      return bestSample.value;
    },
    async updateTimeline(date) {
      const timeline = [];
      for (const samples of this.samples) {
        const measure = this.measures.find(m => m.id === samples.measure);
        const data = this.findNearest(samples.samples, date);
        timeline.push({
          measure: measure.name,
          type: measure.type,
          unit: measure.unit,
          value: data ? data : '-'
        });
      }
      this.timeline = timeline;
    }
  }
};
</script>
