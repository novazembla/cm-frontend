import React, { useCallback } from "react";
import { Flex, Link, chakra } from "@chakra-ui/react";
import { useRouter } from "next/router";

import { useIsBreakPoint } from "~/hooks/useIsBreakPoint";
import { SVG } from "~/components/ui/SVG";

export const PageTitle = ({
  title,
  type,
  center,
  h1,
  backlink,
  url
}: {
  backlink?: boolean;
  url?: string;
  title: string;
  type: string;
  h1?: boolean;
  center?: boolean;
}) => {
  const { isMobile } = useIsBreakPoint();
  const router = useRouter();

  const back = useCallback(
    (event: React.MouseEvent) => {
      event.preventDefault();

      // Detect if there's actual navigation history
      if (window.history.length > 1) {
        router.back();
      } else if (url) {
        router.push(url);
      } else {
        router.push("/"); // fallback to homepage if no url provided
      }
    },
    [router, url]
  );

  return (
    <Flex mb={type === "high" ? (isMobile ? "2em" : "3em") : "0.6em"} gap="0.5em">
      {
        backlink ? <Link href={url ?? "#"} onClick={back} transform="rotate(180deg)"><SVG
              type="arrow-right"
              width={isMobile ? 30 : 40}
              height={isMobile ? 17 : 22}
            /></Link> : null
      }
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
    </Flex>
  );
};
