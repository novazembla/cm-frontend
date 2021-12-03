import { useRouter } from "next/router";
import NextLink from "next/link";
import React from "react";

export const ActiveLink = ({
  children,
  activeClassName = "active",
  href,
  target,
  style = {
    textDecoration:"none"
  },
  ...props
}: {
  children: React.ReactNode;
  activeClassName?: string;
  target?: string;
  href: string;
  onClick?: (event: MouseEvent) => void,
  props?: any;
  style?: any;
}) => {
  const { asPath } = useRouter();

  // pages/index.js will be matched via props.href
  // pages/about.js will be matched via props.href
  // pages/[slug].js will be matched via props.as

  const className =
    asPath === href || asPath === (props as any).as
      ? `${activeClassName}`.trim()
      : "";

  return (
    <NextLink href={href}>
      <a {...{ className, target }} onClick={(props as any)?.onClick} style={style}>
        {children}
      </a>
    </NextLink>
  );
};

export default ActiveLink;
