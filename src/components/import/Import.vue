<template>
  <b-container>
    <h1>Import</h1>

    <b-form @submit="onSubmit">
      <b-form-group label="Experiment">
        <b-form-file
          v-model="experiment"
          :state="Boolean(experiment)"
          placeholder="Choose a file..."
          drop-placeholder="Drop file here..."
        />
      </b-form-group>

      <b-form-group label="Alarms">
        <b-form-file
          v-model="alarms"
          :state="Boolean(alarms)"
          placeholder="Choose a file..."
          drop-placeholder="Drop file here..."
        />
      </b-form-group>

      <b-button type="reset" variant="danger" class="mr-2">Reset</b-button>
      <b-button type="submit" variant="primary">Submit</b-button>
    </b-form>
  </b-container>
</template>

<script>
import { importFile } from '../../services/importFile';

export default {
  data: () => ({
    experiment: null,
    alarms: null
  }),
  methods: {
    onSubmit(e) {
      e.preventDefault();
      importFile(this.experiment);
    }
  }
}
</script>

