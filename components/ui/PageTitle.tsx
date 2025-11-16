import React, { useCallback } from "react";
import { Flex, Link, chakra } from "@chakra-ui/react";
import { useRouter } from "next/router";

import { useIsBreakPoint } from "~/hooks/useIsBreakPoint";
import { SVG } from "~/components/ui/SVG";
import { useAppTranslations } from "~/hooks/useAppTranslations";

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
  type: "high" | "highNoTuck" | "medium" | "short";
  h1?: boolean;
  center?: boolean;
}) => {
  const { t } = useAppTranslations();
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
    <Flex 
      mb={type === "high" || type === "highNoTuck" ? (isMobile ? "2em" : "3em") : "0.6em"}
      gap="0.3em"
      alignItems="center"
      justifyContent="center"
      layerStyle={type !== "short" ? backlink ? "headingPullOut" : "headingPullOutShort" : undefined}
    >
      {
        backlink ? <Link href={url ?? "#"} onClick={back} transform="rotate(180deg)"
          display="inline-flex"
          width="24px"
          height="24px"
          alignItems="center"
          justifyContent="center"
          title={t('link.back.title', 'back')}
          mt={"2px"}
        ><SVG
              // type="arrow-right"
              // width={isMobile ? 30 : 40}
              // height={isMobile ? 17 : 22}
              type="cross"
              alt={t('link.back.icon', 'back link icon')}
              wrapped
              fill
              width={isMobile ? 40 : 50}
              height={isMobile ? 40 : 50}
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
        >
          {title}
        </chakra.p>
      )}
    </Flex>
  );
};
