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
          title="Copier"
          :variant="copy === plugin ? 'warning' : 'outline-dark'"
          @click="() => copyPlugin(plugin.i)"
        >
          <v-icon name="copy" />
        </b-button>
        <b-button
          size="sm"
          squared
          title="Editer"
          variant="outline-dark"
          @click="() => editPlugin(plugin.i)"
        >
          <v-icon name="cog" />
        </b-button>
        <b-button
          size="sm"
          squared
          :title="plugin.static ? 'Dévérouiller' : 'Vérouiller'"
          variant="outline-dark"
          @click="() => lockPlugin(plugin.i)"
        >
          <v-icon :name="plugin.static ? 'lock' : 'unlock'" />
        </b-button>

        <b-button
          size="sm"
          squared
          title="Cacher"
          variant="outline-dark"
          @click="() => hidePlugin(plugin.i)"
        >
          <v-icon name="minus" />
        </b-button>
      </b-button-group>
    </div>

    <div
      class="w-100"
      style="height:calc(100% - 31px)"
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
    copy: {
      type: Object,
      required: false,
      default: () => ({})
    },
    copyPlugin: {
      type: Function,
      required: false,
      default: () => {}
    },
    editPlugin: {
      type: Function,
      required: false,
      default: () => {}
    },
    lockPlugin: {
      type: Function,
      required: false,
      default: () => {}
    },
    hidePlugin: {
      type: Function,
      required: false,
      default: () => {}
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

.plugin .header {
  height: 30px;
  overflow: hidden;
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
