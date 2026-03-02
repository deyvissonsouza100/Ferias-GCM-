import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  // Ajuste para o nome do repositório no GitHub Pages
  base: "/gcm-ferias-dashboard/",
});
