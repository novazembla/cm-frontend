import React, { useEffect, useState } from "react";
import Router, {useRouter} from "next/router";
import { Box } from "@chakra-ui/react";
import { useMenuButtonContext, useQuickSearchContext, useScrollStateContext } from "~/provider";

export const LoadingBar = ({ color }: { color: string }) => {
  const [barVisible, setBarVisible] = useState(false);
  const { onMenuClose } = useMenuButtonContext();
  const { onQuickSearchClose } = useQuickSearchContext();

  const router = useRouter()

  const scrollState = useScrollStateContext();
  
  const showBar = () => {
    onMenuClose();
    onQuickSearchClose();
    setBarVisible(true);
  };

  const hideBar = () => {
    setBarVisible(false);
  }

  useEffect(() => {
    router.events.on("routeChangeStart", showBar);
    router.events.on("routeChangeComplete", hideBar);
    router.events.on("routeChangeError", hideBar);
    router.beforePopState(() => {
      console.log("123")
      scrollState.setIsBack(true);
      return true;
    });

    return () => {
      router.events.off("routeChangeStart", showBar);
      router.events.off("routeChangeComplete", hideBar);
      router.events.off("routeChangeError", hideBar);
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
