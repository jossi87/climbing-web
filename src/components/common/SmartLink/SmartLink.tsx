import React, { ComponentProps } from "react";
import { Link } from "react-router-dom";
import { getBaseUrl } from "../../../api";

type Props = Omit<ComponentProps<typeof Link>, "to"> & { to: string };

const isLocal = (url: string) => url.startsWith(getBaseUrl());

const cleanUrl = (url: string) => {
  if (isLocal(url)) {
    return url.substring(getBaseUrl().length);
  }
  return url;
};

export const SmartLink = React.forwardRef<HTMLAnchorElement, Props>(
  ({ to, ...props }, ref) => {
    const rel = isLocal(to) ? props.rel : `${props.rel} noopener noreferrer`;
    return <Link {...props} to={cleanUrl(to)} ref={ref} rel={rel} />;
  }
);
SmartLink.displayName = "SmartLink";
