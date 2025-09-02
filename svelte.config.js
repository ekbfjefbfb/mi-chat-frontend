import adapter from '@sveltejs/adapter-auto';
import sveltePreprocess from 'svelte-preprocess';

export const config = {
  preprocess: sveltePreprocess(),
  kit: {
    adapter: adapter()
  }
};
