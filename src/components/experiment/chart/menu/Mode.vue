<template>
  <b-dropdown
    variant="link"
    size="lg"
    no-caret
  >
    <template slot="button-content">
      <b-button>
        <v-icon :name="icon" /> Mode
      </b-button>
    </template>

    <b-dropdown-item @click="() => onClickMode('select')">
      <v-icon name="object-ungroup" /> Select
    </b-dropdown-item>
    <b-dropdown-item @click="() => onClickMode('zoom')">
      <v-icon name="search-plus" /> Zoom
    </b-dropdown-item>
    <b-dropdown-item @click="() => onClickMode('move')">
      <v-icon name="hand-paper" /> Move
    </b-dropdown-item>
  </b-dropdown>
</template>

<script>
import { mapState } from 'vuex';

export default {
  props: {
    refId: {
      type: Number,
      required: true
    }
  },
  data() {
    return {
      mode: 'select'
    };
  },
  computed: {
    icon() {
      switch (this.mode) {
        case 'zoom':
          return 'search-plus';
        case 'select':
          return 'object-ungroup';
        case 'move':
          return 'hand-paper';
        default:
          return 'search';
      }
    },
    ...mapState({
      chart(state) {
        return state.charts[this.refId].chart;
      }
    })
  },
  mounted() {
    this.chart.changeMode(this.mode);
  },
  methods: {
    onClickMode(mode) {
      this.mode = mode;
      this.chart.changeMode(mode);
    }
  }
}
</script>

