<template>
  <b-container class="mt-2 p-3 theme-alt">
    <h1>Protocole</h1>

    <b-card-group deck>
      <iena />
      <ddsrti />
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
