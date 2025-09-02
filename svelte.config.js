import adapter from '@sveltejs/adapter-netlify';
import preprocess from 'svelte-preprocess';

const config = {
  preprocess: preprocess(),
  kit: {
    adapter: adapter(),
    // Si tu proyecto está en un subdirectorio de Netlify, usa 'paths.base'
    // paths: { base: '/mi-chat-frontend' }
  }
};

export default config;
