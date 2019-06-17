<template>
  <b-container class="mt-2 p-3 theme-alt">
    <h1>Import</h1>

    <b-form
      @submit="onSubmit"
      @reset="onReset"
    >
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
        <b-form-group
          label="Banc"
        >
          <b-form-select
            v-model="benchChoice"
            :options="benchs"
          >
            <template slot="first">
              <option :value="null">
                Créer...
              </option>
            </template>
          </b-form-select>
        </b-form-group>

        <div v-if="benchChoice === null">
          <b-form-group>
            <b-form-input
              v-model="bench"
              :state="Boolean(bench)"
              placeholder="Banc"
              required
            />
          </b-form-group>
        </div>
      </div>

      <div class="border p-3 mb-3">
        <b-form-group
          label="Campagne"
        >
          <b-form-select
            v-model="campaignChoice"
            :options="campaigns"
          >
            <template slot="first">
              <option :value="null">
                Créer...
              </option>
            </template>
          </b-form-select>
        </b-form-group>

        <div v-if="campaignChoice === null">
          <b-form-group>
            <b-form-input
              v-model="campaign"
              :state="Boolean(campaign)"
              placeholder="Campagne"
              required
            />
          </b-form-group>
        </div>
      </div>

      <b-form-group label="Fichier Essai *">
        <b-form-file
          v-model="samplesFile"
          :state="Boolean(samplesFile)"
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

      <b-form-group
        v-if="progressSamples > 0 && progressSamples < 100"
        label="Progression essai"
      >
        <b-progress
          :value="progressSamples"
          :animated="true"
          striped
          variant="success"
        />
      </b-form-group>

      <b-form-group
        v-if="progressAlarms > 0 && progressAlarms < 100"
        label="Progression alarmes"
      >
        <b-progress
          :value="progressAlarms"
          :animated="true"
          striped
          variant="warning"
        />
      </b-form-group>

      <div class="mt-2">
        <b-button
          type="reset"
          variant="danger"
          class="mr-2"
        >
          Réinitialiser
        </b-button>
        <b-button
          type="submit"
          variant="primary"
        >
          Importer
        </b-button>
      </div>

      <b-form-group
        v-if="report"
      >
        <pre>{{ report }}</pre>
      </b-form-group>
    </b-form>
  </b-container>
</template>

<script>
import { fetchBenchs, fetchCampaigns } from '@/plugins/db/dbremote';
import importExperiment from '@/services/import';

const defaultState = {
  reference: 'test',
  name: 'test',
  benchs: [],
  benchChoice: null,
  campaigns: [],
  campaignChoice: null,
  bench: 'test',
  campaign: 'test',
  samplesFile: null,
  alarmsFile: null,
  progressSamples: 0,
  progressAlarms: 0,
  report: null
};

export default {
  name: 'Import',
  data: () => Object.assign({}, defaultState),
  async mounted() {
    this.benchs = await fetchBenchs();
    this.campaigns = await fetchCampaigns();
  },
  methods: {
    async onSubmit(e) {
      e.preventDefault();
      const experiment = {
        reference: this.reference,
        name: this.name,
        bench: this.benchChoice ? this.benchChoice : this.bench,
        campaign: this.campaignChoice ? this.campaignChoice : this.campaign,
        isLocal: false
      };

      importExperiment(experiment, this.samplesFile, this.alarmsFile)
      .subscribe(
        this.onNext.bind(this),
        this.onError.bind(this),
        this.onComplete.bind(this)
      );
    },
    onNext(report) {
      if (report.title === 'Alarms') {
        this.progressAlarms = report.progress;
      } else {
        this.progressSamples = report.progress;
      }
      this.report = JSON.stringify(report, undefined, 2);
    },
    onError(report) {
      this.report = JSON.stringify(report, undefined, 2);
      this.$notify({
        type: 'error',
        title: 'Erreur',
        text: report.errors
      });
    },
    onComplete() {
      this.progressSamples = 100;
      this.$notify({
        type: 'success',
        title: 'Succès',
        text: 'Import réussi'
      });
    },
    onReset(e) {
      e.preventDefault();
      for (let key of Object.keys(defaultState)) {
        this.$data[key] = defaultState[key];
      }
    }
  }
};
</script>
