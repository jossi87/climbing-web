import React from "react";

export const componentDecorator = (href: string, text: string, key: string) => (
  <a href={href} key={key} target="_blank" rel="noreferrer">
    {text}
  </a>
);
