<template>
  <b-container>
    <h1>Config</h1>

    <b-form @submit="onSubmit" class="border p-4">
      <b-form-group label="Host de la base de données">
        <b-input-group prepend="http://">
          <b-form-input v-model="host" />
        </b-input-group>
      </b-form-group>
      <b-button type="submit" variant="primary">Enregistrer</b-button>
    </b-form>

    <div class="border mt-2 p-4">
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
      host: this.$db.getHost()
    };
  },
  methods: {
    onSubmit(e) {
      e.preventDefault();
      this.$db.setHost(this.host)
      .then(() => {
        this.$notify({
          type: 'success',
          title: 'Succès',
          text: `La connexion avec ${this.host} à bien été établis`
        });
      });
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

