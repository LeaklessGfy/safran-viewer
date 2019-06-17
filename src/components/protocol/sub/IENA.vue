<template>
  <b-card
    title="IENA"
    sub-title="Configuration"
    body-class="theme-alt"
  >
    <b-form>
      <!-- IP -->
      <b-form-group>
        <b-input-group prepend="IP">
          <b-form-input
            v-model="protocol.ip"
            placeholder="127.0.0.1"
            type="text"
            required
          />
        </b-input-group>
      </b-form-group>

      <!-- PORT -->
      <b-form-group>
        <b-input-group prepend="Port">
          <b-form-input
            v-model="protocol.port"
            placeholder="1234"
            type="number"
            required
          />
        </b-input-group>
      </b-form-group>

      <!-- MODULE NAME -->
      <b-form-group>
        <b-input-group prepend="Module Name">
          <b-form-input
            v-model="protocol.moduleName"
            placeholder="Module Name"
            type="text"
            required
          />
        </b-input-group>
      </b-form-group>

      <!-- KEY -->
      <b-form-group>
        <b-input-group prepend="Key">
          <b-form-input
            v-model="protocol.key"
            placeholder="1"
            type="number"
            required
          />
        </b-input-group>
      </b-form-group>

      <!-- FREQUENCY -->
      <b-form-group>
        <b-input-group prepend="Frequency">
          <b-form-input
            v-model="protocol.frequency"
            placeholder="500"
            type="number"
            required
          />
        </b-input-group>
      </b-form-group>
    </b-form>
  </b-card>
</template>

<script>
export default {
  name: 'IENA'
};
</script>
