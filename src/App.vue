<template>
  <div
    id="app"
    class="h-100 theme-dark"
  >
    <navbar />
    <router-view />
    <notifications position="top right" />
  </div>
</template>

<script>
import Navbar from './components/shared/Navbar';

export default {
  name: 'App',
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

<style>
body {
  background-color: #22252A !important;
  color: rgb(210, 213, 216) !important;
}

.theme-alt {
  background-color: #2D3035;
  color: rgb(210, 213, 216);
}

.theme-dark .border {
  border-color: #6E7A78 !important;
}

.theme-dark input, .theme-dark select, .theme-dark label,
.theme-dark input:focus, .theme-dark select:focus, .theme-dark label:focus {
  background: none;
  border-color: #6E7A78;
  color: rgb(197, 199, 194);
}

.theme-dark .card {
  border-color: #6E7A78;
}

.theme-dark .input-group-text {
  background-color: #2D3035;
  border-color: rgb(151, 161, 160);
  color: rgb(210, 213, 216);
}
</style>
