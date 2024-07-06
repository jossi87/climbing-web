import type { StorybookConfig } from "@storybook/react-webpack5";

const config: StorybookConfig = {
  stories: ["../src/**/*.mdx", "../src/**/*.stories.@(js|jsx|mjs|ts|tsx)"],
  addons: [
    "@storybook/addon-webpack5-compiler-swc",
    "@storybook/addon-onboarding",
    "@storybook/addon-links",
    "@storybook/addon-essentials",
    "@chromatic-com/storybook",
    "@storybook/addon-interactions",
  ],
  framework: {
    name: "@storybook/react-webpack5",
    options: {},
  },
  staticDirs: [{ from: "../build", to: "/" }],

  // NOTE: I have no idea why this is necessary - Storybook doesn't seem to be
  //       picking up the default babel configurations, like it's supposed to
  //       be doing. I wonder what happened?
  webpackFinal: async (config) => {
    config.module?.rules?.push({
      test: /\.(jsx?|tsx?)$/,
      exclude: [
        /node_modules\/(?!(@react-leaflet|react-leaflet)\/)/i,
        // Tree-shaking *should* make this unnecessary, but let's guard
        // against accidental reverse-imports (a utility being import from a
        // storybook file into production code).
        /\.stories\.tsx?$/,
      ],
      use: {
        loader: "babel-loader",
        options: {
          presets: [
            "@babel/preset-env",
            "@babel/preset-typescript",
            // Runtime automatic with React 17+ allows not importing React in files only using JSX (no state or React methods)
            ["@babel/preset-react", { runtime: "automatic" }],
          ],
        },
      },
    });
    return config;
  },
};
export default config;
