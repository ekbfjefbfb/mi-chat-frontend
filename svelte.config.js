import adapter from '@sveltejs/adapter-netlify';
import preprocess from 'svelte-preprocess';

export default {
  preprocess: preprocess(),
  kit: {
    adapter: adapter(),
    // opcional: cambia el directorio de salida si quieres
    // out: 'build'
  }
};
