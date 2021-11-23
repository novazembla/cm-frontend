import React, { useEffect, useState, useCallback } from "react";
import Router, { useRouter } from "next/router";
import { Box } from "@chakra-ui/react";

export const LoadingBarLight = ({
  color,
  loading,
}: {
  color: string;
  loading?: boolean;
}) => {
  const [barVisible, setBarVisible] = useState(false);
  const [initialLoadDone, setInitialLoadDone] = useState(false);
  const router = useRouter();

  const showBar = useCallback(() => {
    setBarVisible(true);
    if (typeof document !== "undefined") {
      document.body.setAttribute("tabindex", "-1");
    }
  }, []);

  const hideBar = useCallback(() => {
    setBarVisible(false);
    if (typeof document !== "undefined") {
      document.body.removeAttribute("tabindex");
      document.body.classList.remove("tabbed");
      document.body.focus();
    }
  }, []);

  const tabPressed = (e: KeyboardEvent) => {
    if (e.key === "Tab") {
      document.body.classList.add("tabbed");
    }
  };

  useEffect(() => {
    router.beforePopState(() => {
      return true;
    });
    router.events.on("routeChangeStart", showBar);
    router.events.on("routeChangeComplete", hideBar);
    router.events.on("routeChangeError", hideBar);

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
