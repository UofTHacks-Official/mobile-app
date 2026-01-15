module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      ["babel-preset-expo", { jsxImportSource: "nativewind" }],
      "nativewind/babel",
    ],
    plugins: [
      [
        "module-resolver",
        {
          alias: {
            "@": "./src",
          },
        },
      ],
      ["@babel/plugin-transform-class-static-block"],
      // Keep this last so Reanimated can compile worklets correctly
      "react-native-reanimated/plugin",
    ],
  };
};
