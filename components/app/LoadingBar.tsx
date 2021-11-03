import React, { useEffect, useState, useCallback } from "react";
import Router, { useRouter } from "next/router";
import { Box } from "@chakra-ui/react";
import {
  useMenuButtonContext,
  useQuickSearchContext,
  useScrollStateContext,
} from "~/provider";

export const LoadingBar = ({
  color,
  loading,
}: {
  color: string;
  loading?: boolean;
}) => {
  const [barVisible, setBarVisible] = useState(false);
  const { onMenuClose } = useMenuButtonContext();
  const { onQuickSearchClose } = useQuickSearchContext();
  const [initialLoadDone, setInitialLoadDone] = useState(false)
  const router = useRouter();

  const scrollState = useScrollStateContext();

  const showBar = useCallback(() => {
    onMenuClose();
    onQuickSearchClose();
    setBarVisible(true);
  }, [onMenuClose, onQuickSearchClose]);

  const hideBar = useCallback(() => {
    setBarVisible(false);
  }, []);

  useEffect(() => {
    router.events.on("routeChangeStart", showBar);
    router.events.on("routeChangeComplete", hideBar);
    router.events.on("routeChangeError", hideBar);
    router.beforePopState(() => {
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

  useEffect(() => {
    if (!initialLoadDone) {
      if (loading) {
        showBar();
      } else {
        hideBar();
        setInitialLoadDone(true);
      }
    }
    
  }, [loading, showBar, hideBar, setInitialLoadDone, initialLoadDone]);

  return (
    <Box
      bg={color}
      className={`loadingbar ${barVisible ? "loading" : ""}`}
    ></Box>
  );
};
