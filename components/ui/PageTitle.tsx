import React from "react";
import { Box, chakra } from "@chakra-ui/react";
import { useIsBreakPoint } from "~/hooks/useIsBreakPoint";

export const PageTitle = ({
  title,
  type,
  center,
  h1,
}: {
  title: string;
  type: string;
  h1?: boolean;
  center?: boolean;
}) => {
  const { isMobile } = useIsBreakPoint();
  return (
    <Box mb={type === "high" ? (isMobile ? "2em" : "3em") : "0.6em"}>
      {h1 ? (
        <chakra.h1
          textTransform="uppercase"
          w="100%"
          whiteSpace="nowrap"
          textOverflow="ellipsis"
          overflow="hidden"
          id="title"
          className="highlight"
          color="cm.text"
          fontWeight="bold"
          textAlign={center ? "center" : undefined}
          layerStyle={type !== "short" ? "headingPullOut" : undefined}
        >
          {title}
        </chakra.h1>
      ) : (
        <chakra.p
          textTransform="uppercase"
          w="100%"
          whiteSpace="nowrap"
          textOverflow="ellipsis"
          overflow="hidden"
          id="title"
          className="highlight"
          color="cm.text"
          fontWeight="bold"
          textAlign={center ? "center" : undefined}
          layerStyle={type !== "short" ? "headingPullOut" : undefined}
        >
          {title}
        </chakra.p>
      )}
    </Box>
  );
};
