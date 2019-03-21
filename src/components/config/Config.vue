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
      <b-button variant="primary" @click="install" class="mr-2">Installer la BDD {{ db }}</b-button>
      <b-button variant="warning" @click="compact" class="mr-2">Compacter la BDD {{ db }}</b-button>
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
    install() {
      this.$db.install()
      .then(db => {
        this.$notify({
          type: 'success',
          title: 'Succès',
          text: `La base de données ${db} à bien été installée`
        });
      })
    },
    remove() {
      this.$db.remove()
      .then(db => {
        this.$notify({
          type: 'success',
          title: 'Succès',
          text: `La base de données ${db} à bien été supprimée`
        });
      });
    },
    compact() {
      this.$db.compact()
      .then(db => {
        this.$notify({
          type: 'success',
          title: 'Succès',
          text: `La base de donées ${db} à bien été compactée`
        })
      });
    }
  }
};
</script>

