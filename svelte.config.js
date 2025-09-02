import adapter from '@sveltejs/adapter-netlify';
import preprocess from 'svelte-preprocess';

const config = {
  preprocess: preprocess(),
  kit: {
    adapter: adapter(),
    // opcional: si quieres cambiar directorio de salida
    // files: { assets: 'static' }
  }
};

export default config;
