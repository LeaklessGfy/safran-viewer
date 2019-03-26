<template>
  <div id="app">
    <navbar/>
    <router-view class="pt-3"/>
    <notifications position="top right"/>
  </div>
</template>

<script>
import Navbar from './components/shared/Navbar';

export default {
  mounted() {
    this.$db.getErrors()
    .subscribe(err => {
      this.$notify({
        type: 'error',
        title: 'Erreur',
        text: err,
        duration: 5000
      })
    });
  },
  components: {
    navbar: Navbar
  }
};
</script>
