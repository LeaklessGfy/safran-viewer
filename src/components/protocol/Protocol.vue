<template>
  <b-container>
    <h1>Protocole</h1>

    <b-card-group deck>
      <iena />

      <!-- DDSRTI -->
      <ddsrti />

      <!-- AVIS -->
      <avis />
    </b-card-group>
  </b-container>
</template>

<script>
import IENA from './sub/IENA';
import DDSRTI from './sub/DDSRTI';
import AVIS from './sub/AVIS';

export default {
  name: 'Protocol',
  components: {
    iena: IENA,
    ddsrti: DDSRTI,
    avis: AVIS
  }
};
</script>
