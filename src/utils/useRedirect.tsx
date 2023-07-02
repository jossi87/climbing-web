import React from "react";
import { Segment } from "semantic-ui-react";

const Redirecting = () => <Segment>Redirecting &hellip;</Segment>;

export const useRedirect = (
  data: undefined | Record<string, unknown>
): React.ReactNode | null => {
  if (!data?.redirectUrl || typeof data?.redirectUrl !== "string") {
    return null;
  }

  window.location.href = data.redirectUrl;
  return <Redirecting />;
};
