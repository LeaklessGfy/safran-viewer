<template>
  <b-container>
    <h1>Import</h1>

    <b-form @submit="onSubmit">
      <b-form-group>
        <b-form-checkbox v-model="local">
          Local ?
        </b-form-checkbox>
      </b-form-group>

      <b-form-group label="Essai *">
        <b-form-file
          v-model="experiment"
          :state="Boolean(experiment)"
          placeholder="Choisir un fichier..."
          drop-placeholder="Déposer un fichier ici..."
        />
      </b-form-group>

      <b-form-group label="Alarms">
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
import { importFile } from '../../services/importFile';

export default {
  data: () => ({
    local: true,
    experiment: null,
    alarms: null,
    progress: 0
  }),
  methods: {
    onSubmit(e) {
      e.preventDefault();
      if (!this.experiment) {
        return;
      }
      if (this.local) {
        importFile(this.experiment).subscribe(progress => this.progress = progress);
      }
    }
  }
};
</script>

