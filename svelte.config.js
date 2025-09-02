import preprocess from 'svelte-preprocess';
import adapter from '@sveltejs/adapter-auto';

/** @type {import('@sveltejs/kit').Config} */
const config = {
  // Usamos svelte-preprocess para SCSS, PostCSS, y otras transformaciones
  preprocess: preprocess(),

  kit: {
    adapter: adapter(),

    // Configuración opcional para Vite
    vite: {
      // Puedes añadir aquí alias o plugins si lo necesitas
    }
  }
};

export default config;
