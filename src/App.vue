<template>
  <div id="app">
    <navbar/>
    <router-view class="pt-3"/>
    <notifications position="top right"/>
  </div>
</template>

<script>
import Navbar from './components/shared/Navbar';
import Db from './services/db';

export default {
  mounted() {
    Db.fetchErrors().subscribe(err => {
      this.$notify({
        type: 'error',
        title: 'Erreur',
        text: err
      })
    });
  },
  components: {
    navbar: Navbar
  }
};
</script>
