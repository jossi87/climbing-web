import React from "react";
import { type Props as LinkifyProps } from "react-linkify";

export const componentDecorator: LinkifyProps["componentDecorator"] = (
  href,
  text,
  key,
) => (
  <a
    href={href}
    key={key}
    target="_blank"
    rel="noreferrer"
    style={{ wordBreak: "break-all" }}
  >
    {text}
  </a>
);
