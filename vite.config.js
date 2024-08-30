import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  rules: [
    {
      test: /\.ts$/,
      loader: "ts-loader",
      exclude: /node_modules/,
    },
    // 其他规则
  ],
});
