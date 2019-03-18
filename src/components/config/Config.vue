<template>
  <b-container>
    <h1>Config</h1>

    <b-form>
      <b-form-group label="Database URL">
        <b-form-input />
      </b-form-group>

      <b-button type="reset" variant="danger" class="mr-2">Reset</b-button>
      <b-button type="submit" variant="primary">Submit</b-button>
    </b-form>

    <div class="mt-2">
      <b-button variant="danger" @click="removeLocal">Supprimer la bdd Local</b-button>
    </div>
  </b-container>
</template>

<script>
import { removeLocal } from '../../services/db';

export default {
  methods: {
    removeLocal
  }
};
</script>

