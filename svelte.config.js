// svelte.config.js
import preprocess from 'svelte-preprocess';
import adapter from '@sveltejs/adapter-auto';

/** @type {import('@sveltejs/kit').Config} */
const config = {
  // Configuración de preprocess para Svelte
  preprocess: preprocess({
    // Opciones comunes, puedes personalizar más si quieres
    postcss: true,        // si usas PostCSS
    scss: true,           // si quieres soporte para SCSS
    typescript: true      // si quieres soporte para TypeScript
  }),

  kit: {
    // Adaptador para producción
    adapter: adapter(),

    // Otras configuraciones del kit si necesitas
    vite: {
      // Aquí puedes agregar configuraciones de Vite si es necesario
    }
  }
};

export default config;
