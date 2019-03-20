<template>
  <b-container>
    <h1>Config</h1>

    <b-form @submit="onSubmit" class="border p-2">
      <b-form-group label="Database URL">
        <b-form-input v-model="remoteDbName" />
      </b-form-group>
      <b-button type="submit" variant="primary">Enregistrer</b-button>
    </b-form>

    <div class="border mt-2 p-2">
      <p>Base de donnée courante : {{ db }}</p>
      <b-button variant="danger" @click="remove">Supprimer la BDD {{ db }}</b-button>
    </div>
  </b-container>
</template>

<script>
export default {
  subscriptions() {
    return {
      db: this.$db.fetchCurrentDb(),
      remoteDbName: this.$db.fetchRemoteDbName()
    }
  },
  methods: {
    onSubmit(e) {
      e.preventDefault();
      this.$db.setRemoteDbName(this.remoteDbName);
    },
    onReset() {

    },
    remove() {
      this.$db.remove()
      .then(db => {
        this.$notify({
          title: 'Succès',
          text: `La base de donnée ${db} à bien été supprimé`
        });
      });
    }
  }
};
</script>

