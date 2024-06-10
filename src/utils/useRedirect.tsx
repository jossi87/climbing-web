import React from "react";
import { Segment } from "semantic-ui-react";
import { components } from "../@types/buldreinfo/swagger";

const Redirecting = () => <Segment>Redirecting &hellip;</Segment>;

const isRedirect = (v: unknown): v is components["schemas"]["Redirect"] => {
  return (
    !!v &&
    typeof v === "object" &&
    typeof (v as components["schemas"]["Redirect"]).redirectUrl === "string"
  );
};

export const useRedirect = (data: unknown): React.ReactNode | null => {
  if (
    isRedirect(data) &&
    data.redirectUrl &&
    data.redirectUrl !== window.location.href
  ) {
    window.location.href = data.redirectUrl;
    return <Redirecting />;
  }

  return null;
};
