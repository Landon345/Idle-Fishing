import { defineConfig } from "vite";
import { svelte } from "@sveltejs/vite-plugin-svelte";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

export default defineConfig({
  base: "./",
  plugins: [tailwindcss(), svelte()],
  resolve: {
    alias: {
      src: path.resolve(__dirname, "src"),
    },
  },
});
