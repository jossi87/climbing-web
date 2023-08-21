import React from "react";
import { Segment } from "semantic-ui-react";
import { definitions } from "../@types/buldreinfo/swagger";

const Redirecting = () => <Segment>Redirecting &hellip;</Segment>;

const isRedirect = (v: unknown): v is definitions["Redirect"] => {
  return (
    !!v &&
    typeof v === "object" &&
    typeof (v as definitions["Redirect"]).redirectUrl === "string"
  );
};

export const useRedirect = (data: unknown): React.ReactNode | null => {
  if (isRedirect(data) && data.redirectUrl !== window.location.href) {
    window.location.href = data.redirectUrl;
    return <Redirecting />;
  }

  return null;
};
