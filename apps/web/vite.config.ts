import { fileURLToPath } from "node:url";

import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

const apiPort = process.env["API_PORT"] ?? "3100";
const webPort = Number(process.env["WEB_PORT"] ?? "5100");

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  server: {
    port: webPort,
    proxy: {
      "/api": `http://localhost:${apiPort}`,
    },
  },
  preview: {
    port: webPort,
  },
});
