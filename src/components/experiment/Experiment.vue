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
import Db from '../../services/db';
import Chart from './Chart';

export default {
  subscriptions() {
    const sub = Db.fetchExperiment(this.$route.params.id);

    sub.subscribe(
      () => {},
      () => {
        this.$notify({
          type: 'error',
          title: 'Essai non trouvé',
          text: 'Cet essai n\'existe pas sur cette base. Vous allez être redirigé'
        });
        setTimeout(() => window.location = '/', 3000);
      }
    );

    return {
      experiment: sub
    }
  },
  components: {
    chart: Chart
  }
};
</script>
