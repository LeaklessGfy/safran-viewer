<template>
  <b-container fluid>
    <b-button v-b-toggle.accordion1 variant="info">Info</b-button>
    <b-collapse id="accordion1">
      <b-card-body class="p-0">
        <b-table bordered fixed striped hover class="border m-0" :fields="fields" :items="[experiment]"/>
      </b-card-body>
    </b-collapse>

    <chart v-if="experiment.id" class="mt-2" refName="chart1"/>
  </b-container>
</template>

<script>
import Chart from './Chart';
import { dateToString } from '../../services/date';

export default {
  data() {
    return {
      fields: [
        'id',
        'name',
        'reference',
        { key: 'bench', formatter: value => value ? JSON.parse(value).name : '' },
        { key: 'campaign', formatter: value => value ? JSON.parse(value).id12c : '' },
        { key: 'beginTime', formatter: dateToString },
        { key: 'endTime', formatter: dateToString },
        'isLocal'
      ]
    };
  },
  subscriptions() {
    return {
      experiment: this.$db.fetchExperiment(this.$route.params.id)
    };
  },
  methods: {
    dateToString
  },
  components: {
    chart: Chart
  }
};
</script>
