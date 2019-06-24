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
  </b-container>
</template>

<script>
import { epochToString } from '@/services/date';

export default {
  data() {
    return {
      mod: 'default',
      fields: [
        'id',
        'name',
        'reference',
        'bench',
        'campaign',
        { key: 'startDate', formatter: epochToString },
        { key: 'endDate', formatter: epochToString }
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
  beforeDestroy() {
    this.$store.commit(`${this.mod}/RESET`);
  },
  methods: {
    epochToString
  }
};
</script>
