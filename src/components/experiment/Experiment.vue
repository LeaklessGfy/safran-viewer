<template>
  <b-container fluid>
    <b-button v-b-toggle.accordion1 variant="info">Info</b-button>
    <b-collapse id="accordion1">
      <b-card-body class="p-0">
        <b-table bordered fixed striped hover class="border m-0" :items="[experiment]" />
      </b-card-body>
    </b-collapse>

    <chart v-if="experiment.id" class="mt-2" refName="chart1" :experiment="experiment"/>
  </b-container>
</template>

<script>
import Chart from './Chart';

export default {
  subscriptions() {
    return {
      experiment: this.$db.fetchExperiment(this.$route.params.id)
    }
  },
  components: {
    chart: Chart
  }
};
</script>
