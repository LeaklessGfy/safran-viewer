<template>
  <b-container class="pb-5">
    <h1>Import</h1>

    <b-form @submit="onSubmit" @reset="onReset">
      <b-form-group>
        <b-form-checkbox v-model="local">
          Créer en Local ?
        </b-form-checkbox>
      </b-form-group>

      <b-form-group label="Référence">
        <b-form-input
          v-model="reference"
          :state="Boolean(reference)"
          placeholder="Référence de l'essai"
          required
        />
      </b-form-group>

      <b-form-group label="Nom">
        <b-form-input
          v-model="name"
          :state="Boolean(name)"
          placeholder="Nom de l'essai"
          required
        />
      </b-form-group>

      <div class="border p-3 mb-3">
        <b-form-group label="Banc">
          <b-form-select v-model="benchId" :options="benchs">
            <template slot="first">
              <option :value="null">New...</option>
            </template>
          </b-form-select>
        </b-form-group>

        <div v-if="benchId === null">
          <b-form-group label="Référence du banc">
            <b-form-input
              v-model="benchReference"
              :state="Boolean(benchReference)"
              placeholder="Référence du banc"
              required
            />
          </b-form-group>
          <b-form-group label="Nom du banc">
            <b-form-input
              v-model="benchName"
              :state="Boolean(benchName)"
              placeholder="Nom du banc"
              required
            />
          </b-form-group>
        </div>
      </div>

      <div class="border p-3 mb-3">
        <b-form-group label="Campagne">
          <b-form-select v-model="campaignId" :options="campaigns">
            <template slot="first">
              <option :value="null">New...</option>
            </template>
          </b-form-select>
        </b-form-group>

        <div v-if="campaignId === null">
          <b-form-group label="ID12C de la campagne">
            <b-form-input
              v-model="campaignId12c"
              :state="Boolean(campaignId12c)"
              placeholder="ID12C de la campagne"
              required
            />
          </b-form-group>
        </div>
      </div>

      <b-form-group label="Fichier Essai *">
        <b-form-file
          v-model="experiment"
          :state="Boolean(experiment)"
          placeholder="Choisir un fichier..."
          drop-placeholder="Déposer un fichier ici..."
          required
        />
      </b-form-group>

      <b-form-group label="Fichier Alarms">
        <b-form-file
          v-model="alarms"
          placeholder="Choisir un fichier..."
          drop-placeholder="Déposer un fichier ici..."
        />
      </b-form-group>

      <b-form-group v-if="progress > 0" label="Progression">
        <b-progress :value="progress" variant="success" striped :animated="progress < 100" />
      </b-form-group>

      <div class="mt-2">
        <b-button type="reset" variant="danger" class="mr-2">Réinitialiser</b-button>
        <b-button type="submit" variant="primary">Importer</b-button>
      </div>
    </b-form>
  </b-container>
</template>

<script>
import { map } from 'rxjs/operators';
import { callWorker } from '../../services/worker';

export default {
  data: () => ({
    local: true,
    reference: '',
    name: '',
    benchId: null,
    benchName: '',
    benchReference: '',
    campaignId: null,
    campaignId12c: '',
    experiment: null,
    alarms: null,
    progress: 0
  }),
  subscriptions() {
    return {
      benchs: this.$db.fetchBenchs().pipe(
        map(benchs => {
          if (!benchs.rows) return benchs;
          return benchs.rows.map(r => r.value.name);
        })
      ),
      campaigns: this.$db.fetchCampaigns().pipe(
        map(campaigns => {
          if (!campaigns.rows) return campaigns;
          return campaigns.rows.map(r => r.value.id12c);
        }),
      )
    };
  },
  methods: {
    onSubmit(e) {
      e.preventDefault();

      if (!this.local) {
        return;
      }

      callWorker(this.experiment, this.alarms)
      .subscribe(
          progress => this.progress = progress,
          err => this.$notify({
            type: 'error',
            title: 'Error',
            text: err.message
          }),
          () => { }
      );
    },
    onReset() {
      this.local = true;
      this.reference = '';
      this.name = '';
      this.benchId = null;
      this.benchName = '';
      this.benchReference = '';
      this.campaignId = null;
      this.campaignId12c = '';
      this.experiment = null;
      this.alarms = null;
      this.progress = 0;
    }
  }
};
</script>

