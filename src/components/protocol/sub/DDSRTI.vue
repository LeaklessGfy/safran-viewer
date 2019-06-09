<template>
  <b-card
    title="DDSRTI"
    sub-title="Configuration"
  >
    <b-form>
      <!-- IP -->
      <b-form-group>
        <b-input-group prepend="IP">
          <b-form-input
            v-model="ip"
            placeholder="127.0.0.1"
            type="text"
            required
          />
        </b-input-group>
      </b-form-group>

      <!-- DOMAIN ID -->
      <b-form-group>
        <b-input-group prepend="Domain ID">
          <b-form-input
            v-model="domainId"
            placeholder="1"
            type="number"
            required
          />
        </b-input-group>
      </b-form-group>

      <!-- TOPIC -->
      <b-form-group>
        <b-input-group prepend="Topic">
          <b-form-input
            v-model="topic"
            placeholder="Topic"
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
  name: 'DDSRTI',
  data() {
    return {
      ip: '',
      domainId: 1,
      topic: ''
    };
  }
};
</script>
