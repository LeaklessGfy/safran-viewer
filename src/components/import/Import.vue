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
        <b-form-group v-if="benchs.length" label="Banc">
          <b-form-select v-model="bench" :options="benchs">
            <template slot="first">
              <option :value="newBench">New...</option>
            </template>
          </b-form-select>
        </b-form-group>

        <div v-if="bench === newBench">
          <b-form-group label="Référence du banc">
            <b-form-input
              v-model="bench.reference"
              :state="Boolean(bench.reference)"
              placeholder="Référence du banc"
              required
            />
          </b-form-group>
          <b-form-group label="Nom du banc">
            <b-form-input
              v-model="bench.name"
              :state="Boolean(bench.name)"
              placeholder="Nom du banc"
              required
            />
          </b-form-group>
        </div>
      </div>

      <div class="border p-3 mb-3">
        <b-form-group v-if="campaigns.length" label="Campagne">
          <b-form-select v-model="campaign" :options="campaigns">
            <template slot="first">
              <option :value="newCampaign">New...</option>
            </template>
          </b-form-select>
        </b-form-group>

        <div v-if="campaign === newCampaign">
          <b-form-group label="ID12C de la campagne">
            <b-form-input
              v-model="campaign.id12c"
              :state="Boolean(campaign.id12c)"
              placeholder="ID12C de la campagne"
              required
            />
          </b-form-group>
        </div>
      </div>

      <b-form-group label="Fichier Essai *">
        <b-form-file
          v-model="experimentFile"
          :state="Boolean(experimentFile)"
          placeholder="Choisir un fichier..."
          drop-placeholder="Déposer un fichier ici..."
          required
        />
      </b-form-group>

      <b-form-group label="Fichier Alarms">
        <b-form-file
          v-model="alarmsFile"
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

const defaultBench = { reference: 'test', name: 'test' };
const defaultCampaign = { id12c: 'test' };

export default {
  data: () => ({
    local: true,
    reference: 'test',
    name: 'test',
    bench: defaultBench,
    campaign: defaultCampaign,
    newBench: defaultBench,
    newCampaign: defaultCampaign,
    experimentFile: null,
    alarmsFile: null,
    progress: 0
  }),
  subscriptions() {
    return {
      benchs: this.$db.fetchBenchs().pipe(
        map(benchs => {
          if (!benchs.rows) return benchs;
          return benchs.rows.map(r => ({ text: r.value.name, value: r.value }));
        })
      ),
      campaigns: this.$db.fetchCampaigns().pipe(
        map(campaigns => {
          if (!campaigns.rows) return campaigns;
          return campaigns.rows.map(r => ({ text: r.value.id12c, value: r.value }));
        }),
      )
    };
  },
  methods: {
    async onSubmit(e) {
      e.preventDefault();
      const experiment = new this.$db.Experiment(
        this.reference,
        this.name,
        this.bench,
        this.campaign,
        this.$db.getCurrent() === 'local'
      );

      if (!this.local) {
        return;
      }

      callWorker(this.$db, experiment, this.experimentFile, this.alarmsFile, () => {
        this.$notify('Import complete');
      }).subscribe(
        progress => this.progress = progress,
        err => { console.error(err); }
      );
    },
    onReset() {
      this.local = true;
      this.reference = '';
      this.name = '';
      this.bench = defaultBench;
      this.campaign = defaultCampaign;
      this.experimentFile = null;
      this.alarmsFile = null;
      this.progress = 0;
    }
  }
};
</script>

