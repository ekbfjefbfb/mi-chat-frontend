import preprocess from 'svelte-preprocess';
import adapter from '@sveltejs/adapter-netlify';

/** @type {import('@sveltejs/kit').Config} */
const config = {
  preprocess: preprocess(),
  kit: {
    adapter: adapter(),
    // Puedes añadir otras opciones de kit si quieres
  }
};

export default config;
