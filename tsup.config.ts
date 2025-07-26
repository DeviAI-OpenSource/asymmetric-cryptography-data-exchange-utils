import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["cjs", "esm"],
  dts: true,
  splitting: false,
  sourcemap: true,
  clean: true,
  target: "node16",
  platform: "node",
  external: ["crypto"],
  minify: false,
  bundle: true,
});
