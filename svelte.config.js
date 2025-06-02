import { vitePreprocess } from "@sveltejs/vite-plugin-svelte";

const config = {
  preprocess: vitePreprocess(),
  compilerOptions: {
    enableSourcemap: true,
  },
};

export default config; 