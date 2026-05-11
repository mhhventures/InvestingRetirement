import path from "path";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { shipperIdsPlugin } from "./plugins/vite-plugin-shipper-ids";
import { tanstackRouter } from "@tanstack/router-plugin/vite";

export default defineConfig({
  plugins: [
    tanstackRouter({
      target: "react",
      autoCodeSplitting: true,
    }),
    shipperIdsPlugin(),
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
    dedupe: ["react", "react-dom"],
  },
  optimizeDeps: {
    entries: ["index.html", "src/**/*.{ts,tsx,js,jsx}"],

    include: [
      "react",
      "react-dom",
      "react-dom/client",
      "@radix-ui/react-select",
      "@radix-ui/react-slot",
      "@radix-ui/react-alert-dialog",
      "class-variance-authority",
      "clsx",
      "tailwind-merge",
    ],
  },
  build: {
    target: "es2022",
    cssTarget: "chrome111",
    modulePreload: { polyfill: false },
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          if (id.includes("/src/data/products")) return "data-products";
          if (id.includes("/src/lib/guides-data")) return "data-guides";
          if (!id.includes("node_modules")) return;
          if (id.includes("@radix-ui")) return "radix";
          if (id.includes("lucide-react") || id.includes("react-icons")) return "icons";
          if (id.includes("react-day-picker") || id.includes("date-fns")) return "dates";
          if (id.includes("embla-carousel")) return "carousel";
          if (
            id.includes("react-hook-form") ||
            id.includes("@hookform") ||
            id.includes("zod")
          )
            return "forms";
          if (id.includes("@tanstack")) return "tanstack";
          if (id.includes("convex") || id.includes("better-auth")) return "auth";
          if (id.includes("@supabase")) return "supabase";
          if (id.includes("react-dom") || id.includes("scheduler")) return "react-dom";
        },
      },
    },
  },
  server: {
    host: "0.0.0.0",
    strictPort: false,
    allowedHosts: [".modal.host", "shipper.now", "localhost", ".localhost"],
  },
});
