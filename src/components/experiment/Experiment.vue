<template>
  <b-container fluid>
    <h1>Experiment</h1>
    
    <b-card header="Info" :title="experiment.name">
      <b-card-text>
        id : {{ experiment._id }}<br/>
        name : {{ experiment.name }}<br/>
        reference : {{ experiment.reference }}<br/>
        begin : {{ experiment.beginTime }}<br/>
        end : {{ experiment.endTime }}<br/>
        bench : {{ experiment.bench ? experiment.bench.name : '' }}<br/>
        campaign : {{ experiment.campaign ? experiment.campaign.id12c : '' }}
      </b-card-text>
    </b-card>

    <chart class="mt-2"/>
  </b-container>
</template>

<script>
import Chart from './Chart';

export default {
  mounted() {
    this.$db.fetchMeasuresTest(this.$route.params.id);
  },
  subscriptions() {
    return {
      experiment: this.$db.fetchExperiment(this.$route.params.id),
      //measures: this.$db.fetchMeasures(this.$route.params.id)
    }
  },
  components: {
    chart: Chart
  }
};
</script>
