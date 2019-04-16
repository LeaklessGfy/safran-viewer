<template>
  <b-card
    title="AVIS"
    sub-title="Configuration"
  >
    <b-form>
      <!-- URL -->
      <b-form-group>
        <b-input-group prepend="URL">
          <b-form-input
            v-model="url"
            placeholder=""
            type="text"
            required
          />
        </b-input-group>
      </b-form-group>
    </b-form>
  </b-card>
</template>

<script>
export default {
  name: 'AVIS',
  data() {
    return {
      url: ''
    };
  }
};
</script>
