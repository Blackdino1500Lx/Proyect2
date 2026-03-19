export default {
  base: '/',
  build: {
    target: 'esnext',
    rollupOptions: {
      external: (id) => id.startsWith('https://')
    }
  }
}