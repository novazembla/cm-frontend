import { useState, useRef, useCallback, useEffect } from "react";
import { Box, IconButton, useBreakpointValue } from "@chakra-ui/react";
import { useAppTranslations, useIsBreakPoint } from "~/hooks";
import { HiChevronRight } from "react-icons/hi";
import { motion, useAnimation } from "framer-motion";
import { useRouter } from "next/router";
// TODO: Scroll state really needed?
import {
  useScrollStateContext,
  useMenuButtonContext,
  useQuickSearchContext,
  useMainContentContext,
} from "~/provider";
import { primaryInput } from "detect-it";
import { debounce } from "lodash";

const MotionBox = motion(Box);

const contentPaddingTop = {
  base: "60px",
  xl: "80px",
};

export const MainContent = ({
  isDrawer = true,
  isVerticalContent,
  children,
  buttonVisible = true,
  layerStyle,
}: {
  isDrawer?: boolean;
  layerStyle?: string;
  buttonVisible?: boolean;
  isVerticalContent?: boolean;
  children: React.ReactNode;
}) => {
  const mainContentRef = useRef<HTMLDivElement>(null);
  const isAnimationRunningRef = useRef<boolean>(false);
  const panPositionXRef = useRef<number>(0);
  const panActive = useRef<boolean>(false);

  const { isMenuOpen } = useMenuButtonContext();
  const { isQuickSearchOpen } = useQuickSearchContext();
  const { setMainContentStatus } = useMainContentContext();

  const router = useRouter();
  const { isMobile, isTablet, isTabletWide, isDesktopAndUp } =
    useIsBreakPoint();

  const [dragLeft, setDragLeft] = useState(0);

  const [isDrawerOpen, setIsDrawerOpen] = useState(true);
  const [isAnimating, setIsAnimating] = useState(false);

  const [eventListenerAdded, setEventListenerAdded] = useState(false);

  const controls = useAnimation();

  // const [isScrollingObserved, setIsScrollingObserved] = useState(false);

  const scrollState = useScrollStateContext();

  const { t } = useAppTranslations();

  // also update quicksearch
  // also update dragLeft on resize handler below ...
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

  //   TODO: REMOVE if (isScrollingObserved || typeof window === undefined) return;

  //   setIsScrollingObserved(true);

  //   console.log("attaching scroll event");

  //   const trackBody = (e: Event) => {
  //     console.log("tracking boyd scroll", window.scrollY);
  //     scrollState.set(
  //       "body",
  //       router.asPath.replace(/[^a-z]/g, ""),
  //       window.scrollY
  //     );
  //   };
  //   document.addEventListener("scroll", trackBody);

  //   return () => {
  //     if (typeof window === undefined) return;
  //     console.log("removeing scroll event");
  //     document.removeEventListener("scroll", trackBody);
  //   };

  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, []);

  // useEffect(() => {
  //   if (typeof window === "undefined") return;

  //   // reset
  //   const container: HTMLDivElement | null = document.querySelector(
  //     `.animatedMainContent:not(#p-${router.asPath.replace(/[^a-z]/g, "")})`
  //   );

  //   if (container) {
  //     const slug = container.getAttribute("id")?.replace("p-", "") ?? "-";
  //     if (isMobile) {
  //       console.log(2);
  //     } else {
  //       console.log(3, container, slug);
  //       // annoyinigly the clone of the component by framer motion's animate presence
  //       // reset the scoll state of the main content's div.
  //       // we have to reset it
  //       if (scrollState.get("main", slug) > 0) {
  //         console.log(4, container);

  //         const mc: HTMLDivElement | null =
  //           container.querySelector(".mainContent");

  //         if (mc) {
  //           console.log(slug, scrollState.get("main", slug));
  //           setTimeout(() => {
  //             mc.scrollTo({
  //               top: scrollState.get("main", slug),
  //               left: 0,
  //             });
  //           }, 20);
  //           setTimeout(() => {
  //             mc.scrollTo({
  //               top: scrollState.get("main", slug),
  //               left: 0,
  //             });
  //           }, 20);
  //         }
  //       }
  //     }
  //   }
  // }, [router.asPath, isMobile, scrollState]);

  // useEffect(() => {
  //   if (typeof window === "undefined") return;

  //   console.log("setting current router", router.asPath.replace(/[^a-z]/g, ""));

  //   if (isMobile) {
  //     if (
  //       scrollState.get("body", router.asPath.replace(/[^a-z]/g, "")) > 0 &&
  //       scrollState.isBack()
  //     ) {
  //       setTimeout(() => {
  //         window.scrollTo({
  //           top: scrollState.get("main", router.asPath.replace(/[^a-z]/g, "")),
  //           left: 0,
  //         });
  //       }, 20);
  //     } else {
  //       window.scrollTo({
  //         top: 0,
  //         left: 0,
  //       });
  //       scrollState.set("main", router.asPath.replace(/[^a-z]/g, ""), 0);
  //     }
  //   } else {
  //     if (
  //       scrollState.get("main", router.asPath.replace(/[^a-z]/g, "")) > 0 &&
  //       scrollState.isBack()
  //     ) {
  //       setTimeout(() => {
  //         mainContentRef.current?.scrollTo({
  //           top: scrollState.get("main", router.asPath.replace(/[^a-z]/g, "")),
  //           left: 0,
  //         });
  //       }, 20);
  //     } else {
  //       mainContentRef.current?.scrollTo({
  //         top: 0,
  //         left: 0,
  //       });
  //       scrollState.set("main", router.asPath.replace(/[^a-z]/g, ""), 0);
  //     }
  //   }

  //   scrollState.setIsBack(false);
  // }, [router.asPath, isMobile, scrollState]);

  const onResize = useCallback(() => {
    let dL = window.innerWidth - 20 - 40;

    const isMobile = window.matchMedia(
      "(min-width: 21em) and (max-width: 44.999em)"
    ).matches;
    const isTablet = window.matchMedia(
      "(min-width: 45em) and (max-width: 61.9999em)"
    ).matches;
    const isTabletWide = window.matchMedia(
      "(min-width: 62em) and (max-width: 74.9999em)"
    ).matches;
    const isDesktop = window.matchMedia(
      "(min-width: 75em) and (max-width: 119.9999em)"
    ).matches;

    if (isMobile) {
      dL = window.innerWidth * 0.9 - 60;
    } else if (isTablet && !isTabletWide) {
      dL = window.innerWidth * 0.8 - 80;
    } else if (isTabletWide) {
      dL = window.innerWidth * 0.666 - window.innerWidth * 0.1;
    } else if (isDesktop) {
      dL = 655;
    } else {
      dL = 695 + (window.innerWidth * 0.08 - 55) - 100;
    }

    setDragLeft(dL);

    controls.stop();
    controls.start({
      translateX: 0,
      transition: {
        duration: 0.3,
        bounce: false,
      },
    });

    setIsDrawerOpen(true);
    setMainContentStatus(true);
    isAnimationRunningRef.current = false;
  }, [controls, setMainContentStatus]);

  const onResizeDebounced = debounce(onResize, 350);

  useEffect(() => {
    if (typeof window === "undefined") return;

    if (!eventListenerAdded) {
      setEventListenerAdded(true);
      window.addEventListener("resize", onResizeDebounced);
    }

    onResize();

    return () => {
      if (typeof window === "undefined") return;

      window.removeEventListener("resize", onResizeDebounced);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    onResize();
  }, [router.asPath, onResize]);

  const close = () => {
    if (isAnimationRunningRef.current) return;

    setIsDrawerOpen(false);
    setMainContentStatus(false);

    setIsAnimating(true);
    isAnimationRunningRef.current = true;

    controls.stop();
    controls.start({
      translateX: dragLeft * -1,
      transition: {
        duration: 0.3,
        bounce: false,
      },
    });

    setTimeout(() => {
      panActive.current = false;
      setIsAnimating(false);
      isAnimationRunningRef.current = false;
    }, 350);
  };

  const open = () => {
    if (isAnimationRunningRef.current) return;

    setIsDrawerOpen(true);
    setMainContentStatus(true);
    setIsAnimating(true);
    isAnimationRunningRef.current = true;

    controls.stop();
    controls.start({
      translateX: 0,
      transition: {
        duration: 0.3,
        bounce: false,
      },
    });
    setTimeout(() => {
      panActive.current = false;
      isAnimationRunningRef.current = false;
      setIsAnimating(false);
    }, 350);
  };

  const toggle = () => {
    if (isAnimationRunningRef.current) return;

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
            if (isAnimationRunningRef.current || panActive.current) return;

            close();
          }}
          onTouchStart={() => {
            if (isAnimationRunningRef.current || panActive.current) return;
            close();
          }}
          bg="transparent"
          position="fixed"
          w="34vw"
          top="0"
          h="100vh"
          zIndex="2"
          right={isDrawerOpen ? "0px" : undefined}
          cursor="pointer"
          display={
            isTabletWide || isDesktopAndUp || !isDrawerOpen ? "none" : undefined
          }
          sx={{
            touchAction: "none",
          }}
        ></Box>
      )}
      {isDrawer && !isVerticalContent && (isTabletWide || isDesktopAndUp) && (
        <motion.div
          style={{
            position: "fixed",
            top: isMobile ? 60 : 80,
            left: contentWidth,
            marginLeft: -10,
            height: 40,
            width: 40,
            zIndex: 2,
            translateZ: 0,
          }}
          animate={controls}
          transition={{
            duration: isAnimationRunningRef.current ? 0.3 : 0,
            bounce: false,
          }}
          transformTemplate={({ translateX }) => {
            return `translateX(${translateX}) translateZ(0)`;
          }}
        >
          <Box
            marginLeft={buttontLeft}
            borderRadius="5px"
            border="1px solid"
            borderColor="cm.accentLight"
            transition="opacity 0.3"
            w="30px"
            minW="30px"
            h="40px"
            overflow="hidden"
            {...(isMenuOpen || isQuickSearchOpen
              ? {
                  opacity: 0,
                  pointerEvents: "none",
                }
              : {
                  opacity: buttonVisible ? 1 : 0,
                })}
          >
            <Box bg="#fff" w="30px" h="40px">
              <IconButton
                className="svgHover"
                paddingInlineStart="0"
                paddingInlineEnd="0"
                padding="0"
                border="none"
                bg="transparent"
                w="30px"
                minW="30px"
                h="40px"
                overflow="hidden"
                _hover={{
                  bg: "transparent",
                }}
                _active={{
                  bg: "transparent",
                }}
                aria-label={toggleLabel}
                icon={<HiChevronRight />}
                p="0"
                color="cm.accentLight"
                onClick={toggle}
                transition="all 0.5s"
                transform={isDrawerOpen ? "rotate(180deg)" : "rotate(0deg)"}
              />
            </Box>
          </Box>
        </motion.div>
      )}
      <MotionBox
        key={`drawer-${router.asPath}`}
        className="motionDragContainer"
        layerStyle={layerStyle}
        style={{
          position: "absolute",
          top: isVerticalContent
            ? "calc(100vh - var(--locationBarHeight) - 235px)"
            : 0,
          height: isVerticalContent ? "auto" : undefined,
          left: contentLeft,
          width: isVerticalContent ? "100vw" : contentWidth,
          zIndex: 2,
          touchAction: isDrawerOpen ? "pan-y" : "none",
          cursor: !isDrawerOpen ? "pointer" : undefined,
          translateY: 0,
        }}
        transformTemplate={({ translateX }: { translateX: any }) => {
          return `translateX(${translateX}) translateZ(0)`;
        }}
        {...(isDrawer
          ? {
              onTap: !isDrawerOpen
                ? (event: any) => {
                    if (isAnimationRunningRef.current || panActive.current)
                      return;
                    event.preventDefault();
                    open();
                  }
                : undefined,
              onPanStart: (event: any, info: any) => {
                panPositionXRef.current = 0;
                panActive.current = true;
              },
              onPan: (event: any, info: any) => {
                if (isAnimationRunningRef.current) return;

                if (Math.abs(info.offset.y) > Math.abs(info.offset.x)) {
                  return;
                }

                if (!isDrawerOpen) {
                  panPositionXRef.current = -dragLeft + info.offset.x;
                  if (info.offset.x > 30) {
                    open();
                  } else {
                    controls.set({
                      translateX: -dragLeft + info.offset.x,
                    });
                  }
                } else {
                  panPositionXRef.current = Math.min(info.offset.x, 0);
                  controls.set({
                    translateX: Math.min(info.offset.x, 0),
                  });
                }
              },
              onPanEnd: (_event: any, info: any) => {
                setTimeout(() => {
                  panActive.current = false;
                }, 100);

                if (isAnimationRunningRef.current) return;

                if (
                  Math.abs(info.offset.y) > Math.abs(panPositionXRef.current)
                ) {
                  return;
                }

                if (Math.abs(panPositionXRef.current) > dragLeft * 0.25) {
                  if (panPositionXRef.current < 0) {
                    close();
                  } else {
                    open();
                  }
                } else {
                  if (panPositionXRef.current < 0) {
                    open();
                  } else {
                    close();
                  }
                }
              },
              animate: controls,
            }
          : {})}
      >
        <Box
          position="relative"
          w="100%"
          h="100%"
          pointerEvents={
            !isDrawerOpen || panActive.current || isAnimationRunningRef.current
              ? "none"
              : undefined
          }
        >
          <Box
            className="content"
            pt={isVerticalContent ? 0 : contentPaddingTop}
            h="100%"
          >
            <Box
              ref={mainContentRef}
              className="mainContent"
              // TODO: clean up h={
              //   {
              //     // md: "calc(100vh - 60px)",
              //     // xl: "calc(100vh - 80px)",
              //   }
              // }
              // layerStyle={layerStyle}
              minH={
                isMobile
                  ? isVerticalContent
                    ? undefined
                    : "calc(100vh - 60px)"
                  : "calc(100vh - 80px)"
              }
              // overflowY={{
              //   xl: "auto",
              // }}
              // pb={
              //   !isMobile && primaryInput === "touch"
              //     ? "var(--locationBarHeight)"
              //     : undefined
              // }

              // onScroll={(e: React.UIEvent<HTMLDivElement>) => {
              //   scrollState.set(
              //     "main",
              //     router.asPath.replace(/[^a-z]/g, ""),
              //     (e.target as any).scrollTop
              //   );
              // }}
            >
              {children}
            </Box>
          </Box>
        </Box>
      </MotionBox>
    </>
  );
};
