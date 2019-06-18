<template>
  <b-card
    title="AVIS"
    sub-title="Configuration"
    body-class="theme-alt"
  >
    <b-form>
      <!-- URL -->
      <b-form-group>
        <b-input-group prepend="URL">
          <b-form-input
            v-model="url"
            placeholder="http://url.com"
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
