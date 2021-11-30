import React, { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/router";
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
  const router = useRouter();

  const { onMenuClose } = useMenuButtonContext();
  const { onQuickSearchClose } = useQuickSearchContext();
  const { mainContentOpen, setIsMainContentActive } = useMainContentContext();
  const scrollState = useScrollStateContext();

  const [barVisible, setBarVisible] = useState(false);
  const [initialLoadDone, setInitialLoadDone] = useState(false);

  const showBar = useCallback(() => {
    scrollState.setWasBack(scrollState.isBack());
    setIsMainContentActive(false);
    onMenuClose();
    onQuickSearchClose();
    mainContentOpen();
    setBarVisible(true);
    if (typeof document !== "undefined") {
      document.body.setAttribute("tabindex", "-1");
    }
  }, [
    onMenuClose,
    setIsMainContentActive,
    scrollState,
    onQuickSearchClose,
    mainContentOpen,
  ]);

  const hideBar = useCallback(
    (url = null) => {
      setBarVisible(false);
      scrollState.setIsBack(false);

      if (typeof url === "string") scrollState.setCurrentPath(url);

      setIsMainContentActive(true);
      if (typeof document !== "undefined") {
        document.body.removeAttribute("tabindex");
        document.body.classList.remove("tabbed");
        document.body.focus();
      }
    },
    [setIsMainContentActive, scrollState]
  );

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
