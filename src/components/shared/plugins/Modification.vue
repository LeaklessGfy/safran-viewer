<template>
  <div class="p-5">
    <div ref="slider" />
  </div>
</template>

<script>
import * as noUiSlider from 'nouislider';

export default {
  name: 'Modification',
  mounted() {
    const startDate = 0;
    const endDate = 100;
    noUiSlider.create(this.$refs.slider, {
      start: [startDate, endDate],
      margin: 10,
      behaviour: 'drag-tap',
      connect: true,
      tooltips: true,
      range: {
        min: startDate,
        max: endDate
      },
      pips: {
        mode: 'steps',
        density: 3
      }
    });

    console.log(this.$refs.slider.noUiSlider.get());
  }
};
</script>
