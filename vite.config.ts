import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    allowedHosts: ["dev.eagleies.com"], // 🛡️ IZINKAN domain kamu
    host: true, // biar bisa diakses dari luar (misal cloudflared, LAN, dll)
  },
});
