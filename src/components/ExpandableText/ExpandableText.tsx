import React, { useState } from "react";
import { Label, Icon } from "semantic-ui-react";
import { Markdown } from "../Markdown/Markdown";

interface ExpandableTextProps {
  text: string;
  maxLength: number;
  initialIsExpanded?: boolean;
}

const ExpandableText: React.FC<ExpandableTextProps> = ({ text, maxLength }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  if (!text) {
    return null;
  }

  const isTruncated = text.length > maxLength;
  const displayText = isExpanded
    ? text
    : isTruncated
      ? `${text.substring(0, maxLength)}...`
      : text;

  return (
    <>
      {isTruncated && !isExpanded ? (
        displayText
      ) : (
        <Markdown content={displayText} />
      )}
      {isTruncated && (
        <Label as="a" onClick={toggleExpand} size="tiny" basic>
          <Icon name={isExpanded ? "angle up" : "dropdown"} />
          {isExpanded ? "Show Less" : "Show More"}
        </Label>
      )}
    </>
  );
};

export default ExpandableText;
