export default {
  base: '/Proyect2/',
  build: {
    rollupOptions: {
      external: (id) => id.startsWith('https://')
    },
    target: 'esnext'
  }
}