import { defineConfig } from "@vben/vite-config";

import ElementPlus from "unplugin-element-plus/vite";
import { ElementPlusResolver } from "unplugin-vue-components/resolvers";
import Components from "unplugin-vue-components/vite";

export default defineConfig(async () => {
  return {
    application: {},
    vite: {
      plugins: [
        Components({
          dts: "src/types/components.d.ts",
          resolvers: [ElementPlusResolver()],
        }),
        ElementPlus({
          format: "esm",
        }),
      ],
      server: {
        proxy: {
          // 绘本后端管理 API：/admin-api/* -> http://127.0.0.1:8080/api/v1/admin/*
          "/admin-api": {
            changeOrigin: true,
            rewrite: (path) => path.replace(/^\/admin-api/, "/api/v1/admin"),
            target: "http://127.0.0.1:8080",
            ws: true,
          },
        },
      },
    },
  };
});
