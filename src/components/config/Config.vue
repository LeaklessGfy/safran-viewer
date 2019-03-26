<template>
  <b-container>
    <h1>Config</h1>

    <b-form @submit="onSubmit" class="border p-2">
      <b-form-group label="Database URL">
        <b-form-input v-model="remoteHost" />
      </b-form-group>
      <b-button type="submit" variant="primary">Enregistrer</b-button>
    </b-form>

    <div class="border mt-2 p-2">
      <p>Base de donnée courante : {{ db }}</p>
      <b-button variant="primary" @click="install" class="mr-2">Installer la BDD {{ db }}</b-button>
      <b-button variant="danger" @click="drop">Supprimer la BDD {{ db }}</b-button>
    </div>
  </b-container>
</template>

<script>
export default {
  data() {
    return {
      db: 'remote',
      remoteHost: ''
    };
  },
  methods: {
    onSubmit(e) {
      e.preventDefault();
      this.$db.setRemoteDbName(this.remoteDbName);
    },
    install() {
      this.$db.install()
      .then(() => {
        this.$notify({
          type: 'success',
          title: 'Succès',
          text: `La base de données ${this.db} à bien été installée`
        });
      })
    },
    drop() {
      this.$db.drop()
      .then(() => {
        this.$notify({
          type: 'success',
          title: 'Succès',
          text: `La base de données ${this.db} à bien été supprimée`
        });
      });
    }
  }
};
</script>

