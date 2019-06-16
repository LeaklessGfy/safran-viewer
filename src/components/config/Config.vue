<template>
  <b-container class="mt-2 p-3 theme-alt">
    <h1>Config</h1>

    <b-form
      class="border p-4"
      @submit="onSubmit"
    >
      <b-form-group label="Host de la base de données">
        <b-input-group :prepend="config.protocol">
          <b-form-input v-model="config.host" />
        </b-input-group>
      </b-form-group>
      <b-button
        type="submit"
        variant="primary"
      >
        Enregistrer
      </b-button>
    </b-form>

    <div class="border mt-2 p-4">
      <b-row>
        <b-col>
          <b-button
            class="mr-2"
            variant="primary"
            @click="() => install('local')"
          >
            Installer la BDD
            <b-badge variant="light">
              LOCAL
            </b-badge>
          </b-button>
          <b-button
            variant="danger"
            @click="() => drop('local')"
          >
            Supprimer la BDD 
            <b-badge variant="light">
              LOCAL
            </b-badge>
          </b-button>
        </b-col>

        <b-col>
          <b-button
            class="mr-2"
            variant="primary"
            @click="() => install('remote')"
          >
            Installer la BDD
            <b-badge variant="dark">
              REMOTE
            </b-badge>
          </b-button>
          <b-button
            variant="danger"
            @click="() => drop('remote')"
          >
            Supprimer la BDD
            <b-badge variant="dark">
              REMOTE
            </b-badge>
          </b-button>
        </b-col>
      </b-row>
    </div>
  </b-container>
</template>

<script>
export default {
  data() {
    return {
      config: {
        protocol: null,
        host: null
      }
    };
  },
  mounted() {
    this.$db.fetchConfig()
    .then(config => {
      this.config = config;
    });
  },
  methods: {
    onSubmit(e) {
      e.preventDefault();
      this.$db.updateConfig(this.config)
      .then(() => this.$db.initConfig())
      .then(() => {
        this.$notify({
          type: 'success',
          title: 'Succès',
          text: `La connexion avec ${this.host} à bien été établis`
        });
      });
    },
    install(type) {
      const db = type === 'local' ? this.$db.getLocal() : this.$db.getRemote();
      db.install()
      .then(() => {
        this.$notify({
          type: 'success',
          title: 'Succès',
          text: `La base de données ${type} à bien été installée`
        });
      });
    },
    drop(type) {
      const db = type === 'local' ? this.$db.getLocal() : this.$db.getRemote();
      db.drop()
      .then(() => {
        this.$notify({
          type: 'success',
          title: 'Succès',
          text: `La base de données ${type} à bien été supprimée`
        });
      });
    }
  }
};
</script>

