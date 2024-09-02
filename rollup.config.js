import typescript from "@rollup/plugin-typescript";
import { nodeResolve } from "@rollup/plugin-node-resolve";

export default {
  input: "src/main.ts",
  output: {
    file: "build/index.js",
    format: "cjs",
  },
  plugins: [typescript(), nodeResolve()],
};
