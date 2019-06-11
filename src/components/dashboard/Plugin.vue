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

    <slot />
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
  }
};
</script>
