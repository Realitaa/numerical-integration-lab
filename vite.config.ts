import tailwindcss from '@tailwindcss/vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import { defineConfig } from 'vite';
import path from 'path';

// https://vite.dev/config/
export default defineConfig({
  plugins: [tailwindcss(), svelte()],
  resolve: {
    alias: {
      $lib: path.resolve('./src/lib'),
      '$app/navigation': path.resolve('./src/lib/mocks/app-navigation.ts'),
      '$app/environment': path.resolve('./src/lib/mocks/app-environment.ts'),
    },
  },
});
