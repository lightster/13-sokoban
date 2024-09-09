import terser from "@rollup/plugin-terser";
import typescript from "@rollup/plugin-typescript";
import { nodeResolve } from "@rollup/plugin-node-resolve";
import copy from "rollup-plugin-copy";
import kontra from "rollup-plugin-kontra";
import serve from "rollup-plugin-serve";

const isWatching =
  process.argv.includes("-w") || process.argv.includes("--watch");

export default [
  {
    input: "src/main.ts",
    output: {
      file: "build/index.js",
      format: "iife",
    },
    plugins: [
      copy({
        targets: [
          { src: "index.html", dest: "build/" },
          { src: "tiled/sprites.png", dest: "build/assets" },
        ],
      }),
      typescript(),
      nodeResolve(),
      kontra({
        gameObject: { scale: true },
        sprite: { animation: true },
        tileEngine: {
          camera: true,
          query: true,
        },
        debug: isWatching,
      }),
      isWatching && serve("build"),
      !isWatching && terser(),
    ],
  },
];
