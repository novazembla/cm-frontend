import { useState, useRef, useEffect } from "react";
import { Box, IconButton, useBreakpointValue } from "@chakra-ui/react";
import { useAppTranslations, useIsBreakPoint } from "~/hooks";
import { HiChevronRight } from "react-icons/hi";
import { motion, useIsPresent } from "framer-motion";
import { useRouter } from "next/router";
import { useScrollStateContext } from "~/provider";
import { primaryInput } from "detect-it";

const contentPaddingTop = {
  base: "60px",
  // sm: "60px",
  // md: "60px",
  // lg: "60px",
  xl: "80px",
  // xxl: "80px",
};

export const MainContent = ({
  isDrawer = true,
  isVerticalContent,
  children,
  buttonVisible = true,
  layerStyle,
  noMobileBottomPadding,
}: {
  isDrawer?: boolean;
  noMobileBottomPadding?: boolean;
  layerStyle?: string;
  buttonVisible?: boolean;
  isVerticalContent?: boolean;
  children: React.ReactNode;
}) => {
  const panXRef = useRef<number>(0);
  const mainContentRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { isMobile, isTablet, isTabletWide, isDesktopAndUp } =
    useIsBreakPoint();

  const [isDrawerOpen, setIsDrawerOpen] = useState(true);
  const [isAnimationRunning, setIsAnimationRunning] = useState(false);

  const isPresent = useIsPresent();

  const [currentRoute, setCurrentRoute] = useState("");

  const [animation, setAnimation] = useState({});

  const [isScrollingObserved, setIsScrollingObserved] = useState(false);

  const scrollState = useScrollStateContext();

  const { t } = useAppTranslations();

  const closeState = useBreakpointValue({
    base: "calc((-1 * (100vw - 20px)) + 40px)",
    sm: "calc((-1 * (90vw)) + 40px)",
    md: "calc((-1 * (80vw)) + 75px)",
    lg: "calc((-1 * 66.66vw) + 50px)",
    xl: "-625px",
  });

  // also update quicksearch
  const contentWidth = useBreakpointValue({
    base: "calc(100vw - 20px)",
    sm: "calc(90vw)",
    md: "calc(80vw)",
    lg: "66.66vw",
    xl: "675px",
    "2xl": "695px",
  });

  // also update quicksearch
  const contentLeft = useBreakpointValue({
    base: 0,
    xl: "50px",
    "2xl": "calc(8vw - 55px)",
  });

  const buttontLeft = useBreakpointValue({
    xl: "50px",
    "2xl": "calc(8vw - 55px)",
  });

  const PAN_TRIGGER_CLOSE_THRESHOLD = isMobile ? 120 : 180;

  // useEffect(() => {
  //   if (isScrollingObserved || typeof window === undefined) return;

  //   setIsScrollingObserved(true);

  //   console.log("attaching scroll event");

  //   const trackBody = (e: Event) => {
  //     console.log("tracking boyd scroll", window.scrollY);
  //     scrollState.set("body", router.asPath.replace( /[^a-z]/g, '' ), window.scrollY);
  //   };
  //   document.addEventListener('scroll', trackBody);

  //   return () => {
  //     if (typeof window === undefined) return;
  //     console.log("removeing scroll event");
  //     document.removeEventListener("scroll", trackBody);
  //   };
  // }, [isScrollingObserved, setIsScrollingObserved, router, scrollState]);

  useEffect(() => {
    if (isScrollingObserved || typeof window === undefined) return;

    setIsScrollingObserved(true);

    console.log("attaching scroll event");

    const trackBody = (e: Event) => {
      console.log("tracking boyd scroll", window.scrollY);
      scrollState.set(
        "body",
        router.asPath.replace(/[^a-z]/g, ""),
        window.scrollY
      );
    };
    document.addEventListener("scroll", trackBody);

    return () => {
      if (typeof window === undefined) return;
      console.log("removeing scroll event");
      document.removeEventListener("scroll", trackBody);
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    console.log("Binging", router.asPath.replace(/[^a-z]/g, ""));
    setCurrentRoute(router.asPath.replace(/[^a-z]/g, ""));
    if (scrollState.get("main", router.asPath.replace(/[^a-z]/g, "")) > 0) {
      mainContentRef.current?.scrollTo({
        top: scrollState.get("main", router.asPath.replace(/[^a-z]/g, "")),
        left: 0,
      });
    }

    return () => {
      console.log("Unbinding", router.asPath.replace(/[^a-z]/g, ""));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPresent]);

  useEffect(() => {
    if (typeof document === "undefined") return;

    // reset
    if (!isPresent) {
      console.log(1, currentRoute);
      // annoyinigly the clone of the component by framer motion's animate presence
      // reset the scoll state of the main content's div.
      // we have to reset it
      if (scrollState.get("main", currentRoute) > 0) {
        console.log(2, currentRoute);
        const container = document.querySelector(
          `#p-${currentRoute} .mainContent`
        );

        if (container) {
          console.log(
            "set leaving container",
            currentRoute,
            scrollState.get("main", currentRoute)
          );
          container.scrollTo({
            top: scrollState.get("main", currentRoute),
            left: 0,
          });
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPresent]);

  const close = () => {
    if (isAnimationRunning) return;
    setIsDrawerOpen(false);
    setIsAnimationRunning(true);
    setAnimation({
      x: closeState,
    });
    setTimeout(() => {
      setIsAnimationRunning(false);
    }, 250);
  };

  const open = () => {
    if (isAnimationRunning) return;
    setIsDrawerOpen(true);
    setIsAnimationRunning(true);
    setAnimation({
      x: 0,
    });
    setTimeout(() => {
      setIsAnimationRunning(false);
    }, 250);
  };

  const toggle = () => {
    if (isAnimationRunning) return;

    if (isDrawerOpen) {
      close();
    } else {
      open();
    }
  };

  let toggleLabel = isDrawerOpen
    ? t("mainContent.slideToLeft", "Hide content")
    : t("mainContent.slideToRight", "Show content");

  return (
    <>
      {isDrawer && !isVerticalContent && (
        <Box
          onClick={() => {
            close();
          }}
          onTouchStart={() => {
            close();
          }}
          bg="transparent"
          position="fixed"
          w="34vw"
          top="0"
          h="100vh"
          right={isDrawerOpen ? "0px" : undefined}
          cursor="pointer"
          display={
            isTabletWide || isDesktopAndUp || !isDrawerOpen ? "none" : undefined
          }
        ></Box>
      )}
      {isDrawer && !isVerticalContent && (isTabletWide || isDesktopAndUp) && (
        <motion.div
          style={{
            position: "fixed",
            top: 0,
            left: contentWidth,
            height: 40,
            width: 40,
            zIndex: 2,
          }}
          initial={{
            ...animation,
          }}
          animate={{
            ...animation,
          }}
          transition={{
            duration: 0.3,
            bounce: false,
          }}
        >
          <Box
            pt={contentPaddingTop}
            marginLeft={buttontLeft}
            transition="opacity 0.3"
            opacity={buttonVisible ? 1 : 0}
          >
            <Box
              bg="#fff"
              w="30px"
              h="40px"
              borderRadius="5px"
              border="1px solid"
              borderColor="cm.accentLight"
              transform="translateX(-50%) translateY(20px)"
            >
              <IconButton
                aria-label={toggleLabel}
                icon={<HiChevronRight />}
                w="30px"
                h="40px"
                p="0"
                color="cm.accentLight"
                onClick={toggle}
                _hover={{
                  color: "cm.accentLight",
                }}
                transition="all 0.5s"
                transform={isDrawerOpen ? "rotate(180deg)" : "rotate(0deg)"}
                bg="transparent"
                _active={{
                  bg: "transparent",
                }}
              />
            </Box>
          </Box>
        </motion.div>
      )}

      <motion.div
        key={`drawer-${router.asPath}`}
        style={{
          position: "absolute",
          top: isVerticalContent
            ? "calc(100vh - var(--locationBarHeight) - 290px)"
            : 0,
          left: contentLeft,
          height: isVerticalContent ? "auto" : "100vh",
          width: isVerticalContent ? "100vw" : contentWidth,
          zIndex: 2,
          touchAction: "pan-y",
        }}
        {...(isDrawer
          ? {
              onPanStart: (event, info) => {
                panXRef.current = 0;
              },
              onTap: !isDrawerOpen
                ? (event, info) => {
                    event.preventDefault();
                    toggle();
                  }
                : undefined,
              onPan: (event, info) => {
                panXRef.current += info.delta.x;

                if (
                  panXRef.current < 0 &&
                  Math.abs(panXRef.current) > PAN_TRIGGER_CLOSE_THRESHOLD &&
                  isDrawerOpen &&
                  !isAnimationRunning
                ) {
                  close();
                  panXRef.current = 0;
                }
              },
              initial: animation,
              animate: {
                opacity: 1,
                ...animation,
              },
              transition: {
                duration: 0.3,
                bounce: false,
              },
            }
          : {})}
      >
        <Box position="relative" w="100%" h="100%">
          <Box
            className="content"
            pt={isVerticalContent ? 0 : contentPaddingTop}
            h="100%"
          >
            <Box
              ref={mainContentRef}
              className="mainContent"
              h={{
                md: "calc(100vh - 60px)",
                xl: "calc(100vh - 80px)",
              }}
              minH={isMobile ? "calc(100vh - 60px)" : undefined}
              overflowY={{
                md: "auto",
              }}
              pb={
                isMobile && !noMobileBottomPadding
                  ? "60px"
                  : primaryInput === "touch"
                  ? "var(--locationBarHeight)"
                  : undefined
              }
              layerStyle={layerStyle}
              onScroll={(e: React.UIEvent<HTMLDivElement>) => {
                if (isPresent) {
                  scrollState.set(
                    "main",
                    router.asPath.replace(/[^a-z]/g, ""),
                    (e.target as any).scrollTop
                  );
                }
              }}
            >
              {children}
            </Box>
          </Box>
        </Box>
      </motion.div>
    </>
  );
};
