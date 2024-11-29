import React from "react";
import { makeDecorator } from "@storybook/preview-api";
import { MetaContext, DEFAULT_META } from "./meta";

export const withMeta = makeDecorator({
  name: "withMeta",
  parameterName: "meta",
  wrapper: (Story: any, context, { parameters: meta }) => {
    return (
      <MetaContext.Provider
        value={{
          ...DEFAULT_META,
          ...meta,
        }}
      >
        <>{Story(context)}</>
      </MetaContext.Provider>
    );
  },
});
