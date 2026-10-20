<script setup>
import { RouterLink, RouterView } from 'vue-router';

</script>

<template>
  <header class="header">
    <RouterLink to="/">Explorador de países</RouterLink>
  </header>
  <main class="container">
    <RouterView />
  </main>
</template>

<style scoped>
body {
  font-family: system-ui, sans-serif;
  margin: 0;
  background: #f5f6fa;
}

.header {
  background: #2c3e50;
  padding: 1rem 2rem;
}

.header a {
  color: white;
  text-decoration: none;
  font-size: 1.25rem;
}

.container {
  max-width: 1100px;
  margin: 0 auto;
  padding: 1.5rem;
}
</style>
