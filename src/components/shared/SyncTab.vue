<template>
  <b-card :bg-variant="bgVariant" :text-variant="textVariant" :header="header" class="text-center">
    <b-input-group class="mb-3">
      <b-input-group-text slot="prepend">
        <v-icon name="search"/>
      </b-input-group-text>
      <b-form-input v-model="search" @keyup="onSearch"/>
    </b-input-group>
    <b-list-group :variant="bgVariant" style="overflow-y:scroll;max-height:250px">
      <b-list-group-item
        v-for="(change, i) in results ? results : changes"
        v-bind:key="i"
        class="text-left"
        button
        v-b-toggle="type+i"
      >
        <div v-if="!change.deleted">
          <v-icon name="plus" class="text-success"/>
          {{ change.doc._id + " - " + (change.doc.name ? change.doc.name : 'design') }}
        </div>

        <div v-else>
          <v-icon name="minus" class="text-danger"/>
          {{ change.doc._id }}
        </div>

        <b-collapse :id="type+i" class="mt-2 p-2 border" style="background:#fff;">
          <pre style="overflow-x:scroll;">{{ JSON.stringify(change, undefined, 2) }}</pre>
        </b-collapse>
      </b-list-group-item>
    </b-list-group>
  </b-card>
</template>

<script>
export default {
  data() {
    return {
      search: '',
      results: null
    };
  },
  props: {
    bgVariant: String,
    textVariant: String,
    header: String,
    changes: Array,
    type: String
  },
  methods: {
    onSearch() {
      this.results = this.$props.changes.filter(result => result.doc._id.includes(this.search));
    }
  }
};
</script>
