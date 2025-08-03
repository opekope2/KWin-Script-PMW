import typescript from "@rollup/plugin-typescript";

/** @type {import("rollup").RollupOptions} */
export default {
  input: "contents/src/main.ts",
  output: {
    file: "contents/code/main.js",
    format: "cjs",
  },
  plugins: [typescript()],
};
