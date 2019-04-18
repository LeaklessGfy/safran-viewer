<template>
  <b-container
    v-if="experiment"
    fluid
    class="mb-5"
  >
    <b-button
      v-b-toggle.accordion1
      variant="info"
    >
      Info
    </b-button>
    
    <b-collapse id="accordion1">
      <b-card-body class="p-0">
        <b-table
          bordered
          fixed
          striped
          hover
          class="border m-0"
          :fields="fields"
          :items="[experiment]"
        />
      </b-card-body>
    </b-collapse>

    <chart
      v-if="experiment"
      :mod="mod"
      class="mt-2"
    />
  </b-container>
</template>

<script>
import Chart from './Chart';
import { dateToString } from '@/services/date';

export default {
  components: {
    chart: Chart
  },
  data() {
    return {
      mod: 'default',
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
  computed: {
    experiment() {
      return this.$store.state[this.mod].experiment;
    }
  },
  mounted() {
    this.$store.dispatch(`${this.mod}/fetchExperiment`, this.$route.params.id);
  },
  methods: {
    dateToString
  }
};
</script>
