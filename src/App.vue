<template>
  <div id="app">
    <navbar/>
    <router-view class="pt-3"/>
  </div>
</template>

<script>
import Navbar from './components/Navbar';

export default {
  components: {
    navbar: Navbar
  }
};
</script>
