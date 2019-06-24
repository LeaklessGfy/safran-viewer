<template>
  <b-container class="mt-2 p-3 theme-alt">
    <h1>Config</h1>

    <b-form
      class="border p-4"
      @submit="onSubmit"
    >
      <b-form-group label="Host de la base de données">
        <b-input-group>
          <b-input-group-prepend>
            <b-form-select
              v-model="config.protocol"
              :options="['http', 'https']"
            />
          </b-input-group-prepend>

          <b-form-input v-model="config.host" />

          <b-input-group-append>
            <b-input-group prepend=":">
              <b-form-input v-model="config.port" />
            </b-input-group>
          </b-input-group-append>
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
import { fetchConfig, updateConfig, installDB as localInstall, dropDB as localDrop } from '@/services/db/local';
import { installDB as remoteInstall, dropDB as remoteDrop } from '@/services/db/remote';

export default {
  data() {
    return {
      config: {
        protocol: null,
        host: null
      }
    };
  },
  async mounted() {
    this.config = await fetchConfig();
  },
  methods: {
    async onSubmit(e) {
      e.preventDefault();
      await updateConfig(this.config);
      this.$notify({
        type: 'success',
        title: 'Succès',
        text: `La connexion avec ${this.config.host} à bien été établis`
      });
    },
    async install(type) {
      const installDB = type === 'local' ? localInstall : remoteInstall;
      await installDB();
      this.$notify({
        type: 'success',
        title: 'Succès',
        text: `La base de données ${type} à bien été installée`
      });
    },
    async drop(type) {
      const dropDB = type === 'local' ? localDrop : remoteDrop;
      await dropDB();
      this.$notify({
        type: 'success',
        title: 'Succès',
        text: `La base de données ${type} à bien été supprimée`
      });
    }
  }
};
</script>

