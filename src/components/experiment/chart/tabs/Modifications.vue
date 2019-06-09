<template>
  <b-table
    striped
    hover
    :fields="fields"
    :items="modifications"
    class="mt-2"
  >
    <template
      slot="isLoad"
      slot-scope="data"
    >
      <b-button
        v-if="!data.item.isLoad"
        size="sm"
        @click="() => onLoadMeasure(data.item.measure)"
      >
        <v-icon name="cloud-download-alt" />
        Charger
      </b-button>
      <b-badge
        v-else
        variant="success"
      >
        Chargé
      </b-badge>
    </template>
    <template
      slot="actions"
      slot-scope="scope"
    >
      <b-button
        v-if="!scope.item.isApply"
        size="sm"
        variant="primary"
        :disabled="!scope.item.isLoad"
        @click="() => onToggleModification(scope.item)"
      >
        Appliquer
      </b-button>
      <b-button
        v-else
        size="sm"
        variant="warning"
        @click="() => onToggleModification(scope.item)"
      >
        Enlever
      </b-button>
      <b-button
        size="sm"
        variant="danger"
        class="ml-2"
        @click="() => onRemoveModification(scope.item)"
      >
        Supprimer
      </b-button>
    </template>
  </b-table>
</template>

<script>
import { dateToTime } from '@/services/date';

export default {
  props: {
    mod: {
      type: String,
      required: true
    },
    service: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      fields: [
        'measure',
        { key: 'startDate', formatter: dateToTime },
        { key: 'endDate', formatter: dateToTime },
        'operation',
        'value',
        'isApply',
        'isLoad',
        'actions'
      ]
    };
  },
  computed: {
    experiment() {
      return this.$store.state[this.mod].experiment;
    },
    modifications() {
      return this.$store.state[this.mod].modifications;
    }
  },
  mounted() {
    this.$store.dispatch(`${this.mod}/fetchModifications`, this.experiment.id);
  },
  methods: {
    onToggleModification(modification) {
      this.$store.commit(`${this.mod}/TOGGLE_MODIFICATION`, modification);
      if (modification.isApply) {
        this.service.addRange(modification);
      } else {
        this.service.removeRange(modification);
      }
    },
    onRemoveModification(modification) {
      this.service.removeRange(modification.id);
      this.$store.dispatch(`${this.mod}/removeModification`, modification);
    },
    async onLoadMeasure(id) {
      const measure = await this.$db.fetchMeasure(id);
      const samples = await this.$db.fetchSamples(id);
      this.service.addMeasure(measure, samples);
      this.$store.dispatch(`${this.mod}/addMeasure`, measure);
    },
    dateToTime
  }
};
</script>
