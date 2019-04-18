<template>
  <b-tabs content-class="mt-3">
    <!-- MODIFICATIONS -->
    <b-tab
      title="Modifications"
      active
    >
      <modification
        :mod="mod"
        :experiment="experiment"
        :service="service"
      />
      <modifications
        :mod="mod"
        :experiment="experiment"
        :service="service"
      />
    </b-tab>

    <!-- LECTURE -->
    <b-tab title="Lecture">
      <b-table
        striped
        hover
        :items="timeline"
      />
    </b-tab>
  </b-tabs>
</template>

<script>
import Modification from './tabs/Modification';
import Modifications from './tabs/Modifications';

export default {
  components: {
    modification: Modification,
    modifications: Modifications
  },
  props: {
    mod: {
      type: String,
      required: true
    },
    experiment: {
      type: Object,
      required: true
    },
    service: {
      type: Object,
      required: true
    }
  },
  computed: {
    timeline() {
      return this.$store.state[this.mod].timeline;
    }
  },
};
</script>
