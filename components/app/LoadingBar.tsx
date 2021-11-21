import React, { useEffect, useState, useCallback } from "react";
import Router, { useRouter } from "next/router";
import { Box } from "@chakra-ui/react";
import {
  useMenuButtonContext,
  useQuickSearchContext,
  useScrollStateContext,
  useMainContentContext,
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
  const { setMainContentStatus, mainContentOpen } = useMainContentContext();
  const [initialLoadDone, setInitialLoadDone] = useState(false);
  const router = useRouter();

  const scrollState = useScrollStateContext();

  const showBar = useCallback(() => {
    scrollState.setWasBack(scrollState.isBack());

    onMenuClose();
    onQuickSearchClose();
    mainContentOpen();
    setBarVisible(true);
    if (typeof document !== "undefined") {
      document.body.setAttribute("tabindex", "-1");
    }
  }, [onMenuClose, scrollState, onQuickSearchClose, mainContentOpen]);

  const hideBar = useCallback(() => {
    setBarVisible(false);
    setMainContentStatus(true);
    scrollState.setIsBack(false);
    scrollState.setCurrentPath(Router.asPath);
    if (typeof document !== "undefined") {
      document.body.removeAttribute("tabindex");
      document.body.classList.remove("tabbed");
      document.body.focus();
    }
  }, [setMainContentStatus, scrollState]);

  const tabPressed = (e: KeyboardEvent) => {
    if (e.key === "Tab") {
      document.body.classList.add("tabbed");
    }
  };

  useEffect(() => {
    router.beforePopState(() => {
      scrollState.setIsBack(true);
      return true;
    });
    router.events.on("routeChangeStart", showBar);
    router.events.on("routeChangeComplete", hideBar);
    router.events.on("routeChangeError", hideBar);

    if (typeof document !== "undefined") {
      document.body.addEventListener("keyup", tabPressed);
    }

    return () => {
      router.events.off("routeChangeStart", showBar);
      router.events.off("routeChangeComplete", hideBar);
      router.events.off("routeChangeError", hideBar);

      if (typeof document !== "undefined") {
        document.body.removeEventListener("keyup", tabPressed);
      }
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
