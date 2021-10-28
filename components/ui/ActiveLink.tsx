import { useRouter } from "next/router";
import PropTypes from "prop-types";
import NextLink from "next/link";
import React, { Children } from "react";
import { chakra } from "@chakra-ui/react";

export const ActiveLink = ({
  children,
  activeClassName = "active",
  href,
  ...props
}: {
  children: React.ReactNode;
  activeClassName?: string;
  href: string;
  onClick?: (event: MouseEvent) => void,
  props?: any;
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
    <NextLink href={href} scroll={false}>
      <a {...{ className }} onClick={(props as any)?.onClick}>
        {children}
      </a>
    </NextLink>
  );
};

export default ActiveLink;
