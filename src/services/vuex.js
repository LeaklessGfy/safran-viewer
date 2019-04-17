export const vuexProperty = (ctx, property) => ({
  get() {
    return ctx.$store.state.charts[ctx.refId][property];
  },
  set(value) {
    ctx.$store.commit('updateChart', { refId: ctx.refId, property: value });
  }
});
