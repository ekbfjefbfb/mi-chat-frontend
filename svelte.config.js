import adapter from '@sveltejs/adapter-netlify';
import preprocess from 'svelte-preprocess';

const config = {
  preprocess: preprocess(),
  kit: {
    adapter: adapter(),
    // Solo descomenta esto si tu app no está en la raíz
    // paths: { base: '/mi-chat-frontend' }
  }
};

export default config;
