import { Preview } from "@storybook/react";
import { withRouter } from "storybook-addon-remix-react-router";

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/,
      },
    },
  },
  decorators: [withRouter],
};

export default preview;
