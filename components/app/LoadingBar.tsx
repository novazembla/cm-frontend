import React, { useEffect, useState } from "react";
import Router from "next/router";
import { Box } from "@chakra-ui/react";
import { useMenuButtonContext, useQuickSearchContext } from "~/provider";

export const LoadingBar = ({ color }: { color: string }) => {
  const [barVisible, setBarVisible] = useState(false);
  const { onMenuClose } = useMenuButtonContext();
  const { onQuickSearchClose } = useQuickSearchContext();

  const showBar = () => {
    onMenuClose();
    onQuickSearchClose();
    setBarVisible(true);
  };

  const hideBar = () => {
    setBarVisible(false);
  }

  useEffect(() => {
    Router.events.on("routeChangeStart", showBar);
    Router.events.on("routeChangeComplete", hideBar);
    Router.events.on("routeChangeError", hideBar);

    return () => {
      Router.events.off("routeChangeStart", showBar);
      Router.events.off("routeChangeComplete", hideBar);
      Router.events.off("routeChangeError", hideBar);
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      {barVisible && (
        <Box
          bg={color}
          className={`loadingbar ${barVisible ? "loading" : ""}`}
        ></Box>
      )}
    </>
  );
};
