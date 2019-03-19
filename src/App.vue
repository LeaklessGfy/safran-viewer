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
  components: {
    navbar: Navbar
  }
};
</script>
