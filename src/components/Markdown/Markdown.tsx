import React from "react";
import { md } from "./parser";

interface MarkdownProps {
  content: string;
}

export const Markdown: React.FC<MarkdownProps> = ({ content }) => {
  if (!content) {
    return null;
  }

  return (
    <div
      style={{ paddingTop: "10px" }}
      dangerouslySetInnerHTML={{ __html: md.render(content) }}
    />
  );
};
