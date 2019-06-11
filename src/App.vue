<template>
  <div
    id="app"
    class="h-100"
  >
    <navbar />
    <router-view />
    <notifications position="top right" />
  </div>
</template>

<script>
import Navbar from './components/shared/Navbar';

export default {
  components: {
    navbar: Navbar
  },
  data() {
    return {
      sub: null
    };
  },
  mounted() {
    this.sub = this.$db.getErrors()
    .subscribe(err => {
      this.$notify({
        type: 'error',
        title: 'Erreur',
        text: err,
        duration: 5000
      });
    });
  },
  beforeDestroy() {
    this.sub.unsubscribe();
  }
};
</script>
