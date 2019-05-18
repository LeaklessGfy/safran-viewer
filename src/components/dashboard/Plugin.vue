<template>
  <div class="w-100 h-100">
    <b-button
      size="sm"
      variant="outline-dark"
      class="position-fixed"
      style="top:0;left:0;"
    >
      {{ plugin.component.toUpperCase() }}
    </b-button>

    <b-button-group
      class="position-fixed"
      style="top:0;right:0;"
    >
      <b-button
        size="sm"
        variant="outline-dark"
        @click="() => toggleConfig()"
      >
        <v-icon name="cog" />
      </b-button>

      <b-button
        size="sm"
        variant="outline-dark"
        @click="() => togglePlugin(plugin.i)"
      >
        <v-icon :name="plugin.static ? 'lock' : 'unlock'" />
      </b-button>

      <b-button
        size="sm"
        variant="outline-dark"
        @click="() => removePlugin(plugin.i)"
      >
        <v-icon name="minus" />
      </b-button>
    </b-button-group>

    <div
      v-show="config || !experiment"
      class="mb-4 px-4 pb-3 mw-100 mh-100"
      style="overflow-y:scroll;"
    >
      <b-form-group label="Essai">
        <b-form-select
          v-model="experiment"
          :options="experiments"
        />
      </b-form-group>

      <b-form-group
        v-if="experiment"
        label="Mesures"
      >
        <measures
          :experiment="experiment.id"
          :selected-measures="selectedMeasures"
          :on-cancel-measures="onCancelMeasures"
          :on-submit-measures="onSubmitMeasures"
        />
      </b-form-group>
    </div>

    <slot
      v-show="!config"
      :experiment="experiment"
      :selected-measures="selectedMeasures"
      :removed-measures="removedMeasures"
    />
  </div>
</template>

<script>
export default {
  props: {
    plugin: {
      type: Object,
      required: true
    },
    togglePlugin: {
      type: Function,
      required: true
    },
    removePlugin: {
      type: Function,
      required: true
    }
  },
  data() {
    return {
      config: true,
      experiment: null,
      selectedMeasures: [],
      removedMeasures: []
    };
  },
  computed: {
    experiments() {
      return this.$store.state.experiments.map(experiment => ({
        value: experiment,
        text: experiment.reference + ' ' + experiment.name
      }));
    }
  },
  methods: {
    toggleConfig() {
      if (!this.experiment) {
        return;
      }
      this.config = !this.config;
    },
    onCancelMeasures() {
      this.config = false;
    },
    onSubmitMeasures(selectedMeasures, removedMeasures) {
      this.selectedMeasures = selectedMeasures;
      this.removedMeasures = removedMeasures;
      this.config = false;
    }
  }
};
</script>
