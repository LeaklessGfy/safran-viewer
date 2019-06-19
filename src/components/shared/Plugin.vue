<template>
  <div class="plugin w-100 h-100">
    <div class="header">
      <b-button
        size="sm"
        variant="outline-dark"
        class="title"
      >
        {{ plugin.component.toUpperCase() }}
      </b-button>

      <b-button-group class="actions">
        <b-button
          size="sm"
          squared
          variant="outline-dark"
          :href="'/#/plugins/' + plugin._id"
        >
          <v-icon name="cog" />
        </b-button>
        <b-button
          size="sm"
          squared
          variant="outline-dark"
          @click="() => togglePlugin(plugin.i)"
        >
          <v-icon :name="plugin.static ? 'lock' : 'unlock'" />
        </b-button>

        <b-button
          size="sm"
          squared
          variant="outline-dark"
          @click="() => removePlugin(plugin.i)"
        >
          <v-icon name="minus" />
        </b-button>
      </b-button-group>
    </div>

    <div
      class="w-100"
    >
      <slot />
    </div>
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

<style scoped>
.plugin {
  border: 1px solid #343436;
}

.plugin:hover {
  border-color: #969697;
}

.plugin .header .title {
  border-top: none;
  border-left: none;
}

.plugin .header .actions {
  float: right;
}

.plugin .header .actions button, .plugin .header .actions a {
  border-top: none;
  border-right: none;
}
</style>
