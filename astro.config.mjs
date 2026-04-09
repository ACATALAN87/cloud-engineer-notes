import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  site: 'https://acatalan87.github.io',
  base: '/cloud-engineer-notes',
  integrations: [
    react(),
  ],
  vite: {
    plugins: [tailwindcss()],
  },
});