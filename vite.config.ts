import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { fileURLToPath } from "url";

// Fix para __dirname en módulos ES (necesario para Vercel)
const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      // Apuntamos a donde está realmente tu código
      "@": path.resolve(__dirname, "./client/src"),
      "@shared": path.resolve(__dirname, "./shared"),
    },
  },
  // IMPORTANTE: Quitamos "root: client" porque tu index.html está afuera.
  // Al quitarlo, usa la raíz por defecto, que es lo que queremos.
  
  build: {
    outDir: "dist", // Estándar de Vercel
    emptyOutDir: true,
  },
});