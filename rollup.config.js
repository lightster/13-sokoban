import typescript from "@rollup/plugin-typescript";
import { nodeResolve } from "@rollup/plugin-node-resolve";
import copy from "rollup-plugin-copy";
import serve from "rollup-plugin-serve";

export default [
  {
    input: "src/main.ts",
    output: {
      file: "build/index.js",
      format: "cjs",
    },
    plugins: [
      copy({
        targets: [
          { src: "index.html", dest: "build/" },

          { src: "tiled/*.{tmj,png,tsj}", dest: "build/assets" },
        ],
      }),
      typescript(),
      nodeResolve(),
      serve("build"),
    ],
  },
];
