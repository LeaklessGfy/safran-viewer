<template>
  <b-container fluid>
    <h1>Experiment</h1>
    
    <b-card header="Info" :title="experiment.name">
      <b-card-text>
        name : {{ experiment.name }}<br/>
        reference : {{ experiment.reference }}<br/>
        begin : {{ experiment.begin_time }}<br/>
        end : {{ experiment.end_time }}<br/>
        bench : {{ experiment.bench ? experiment.bench.name : '' }}<br/>
        campaign : {{ experiment.campaign ? experiment.campaign.id12c : '' }}
      </b-card-text>
    </b-card>

    <chart/>
  </b-container>
</template>

<script>
import { fetchExperiment } from '../../services/db';
import Chart from './Chart';

export default {
  subscriptions() {
    return {
      experiment: fetchExperiment(this.$route.params.id)
    }
  },
  components: {
    chart: Chart
  }
};
</script>
