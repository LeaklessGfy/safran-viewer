<template>
  <b-container class="pb-5">
    <h1>Import</h1>

    <b-form
      @submit="onSubmit"
      @reset="onReset"
    >
      <b-form-group label="Créer en local ?">
        <toggle-button v-model="local" />
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
          <b-form-group label="Banc">
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
          <b-form-group label="Campagne">
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
        v-if="progress > 0 && progress < 100"
        label="Progression"
      >
        <b-progress
          :value="progress"
          :animated="progress < 100"
          striped
          variant="success"
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
    </b-form>
  </b-container>
</template>

<script>
import { ImportServiceFactory } from '@/services/import';

const defaultState = {
  local: false,
  reference: 'test',
  name: 'test',
  benchChoice: null,
  campaignChoice: null,
  bench: 'test',
  campaign: 'test',
  samplesFile: null,
  alarmsFile: null,
  progress: 0
};

export default {
  data: () => Object.assign({}, defaultState),
  computed: {
    benchs() {
      return this.$store.state.benchs;
    },
    campaigns() {
      return this.$store.state.campaigns;
    }
  },
  mounted() {
    this.$store.dispatch('fetchBenchs');
    this.$store.dispatch('fetchCampaigns');
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

      const service = ImportServiceFactory(this.local, this.$db);
      const observable = await service.init(experiment, this.samplesFile, this.alarmsFile);
      observable.subscribe(
        progress => this.progress = progress,
        err => this.$notify({
          type: 'error',
          title: 'Erreur',
          text: err
        }),
        () => {
          this.progress = 100;
          this.$notify({
            type: 'success',
            title: 'Succès',
            text: 'Import réussi'
          });
        }
      );
      service.import();
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

