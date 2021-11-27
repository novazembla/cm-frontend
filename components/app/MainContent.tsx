
import { useState, useRef, useCallback, useEffect } from "react";
import { Box, IconButton, useBreakpointValue, chakra } from "@chakra-ui/react";
import { useIsBreakPoint } from "~/hooks/useIsBreakPoint";
import { useAppTranslations } from "~/hooks/useAppTranslations";

import { motion, useAnimation } from "framer-motion";
import { useRouter } from "next/router";
import {
  useMenuButtonContext,
  useQuickSearchContext,
  useMainContentContext,
} from "~/provider";
import { SVG } from "~/components/ui/SVG";

import debounce from "lodash/debounce";

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
  const { setMainContentStatus, setMainContentFunctions, isMainContentActive } =
    useMainContentContext();

  const router = useRouter();
  const { isMobile, isTabletWide, isDesktopAndUp } = useIsBreakPoint();

  const [dragLeft, setDragLeft] = useState(0);

  const [isDrawerOpen, setIsDrawerOpen] = useState(true);

  const [eventListenerAdded, setEventListenerAdded] = useState(false);

  const controls = useAnimation();

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
    if (!isMainContentActive) return;

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

  const close = useCallback(() => {
    if (!isMainContentActive) return;
    if (isAnimationRunningRef.current) return;

    setIsDrawerOpen(false);
    setMainContentStatus(false);

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
      isAnimationRunningRef.current = false;
      setIsDrawerOpen(false);
    }, 350);
  }, [controls, setMainContentStatus, dragLeft, isMainContentActive]);

  const open = useCallback(() => {
    if (!isMainContentActive) return;
    if (isAnimationRunningRef.current) return;

    setIsDrawerOpen(true);
    setMainContentStatus(true);
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
      setIsDrawerOpen(true);
    }, 350);
  }, [controls, setMainContentStatus, isMainContentActive]);

  const toggle = () => {
    if (!isMainContentActive) return;
    if (isAnimationRunningRef.current) return;

    if (isDrawerOpen) {
      close();
    } else {
      open();
    }
  };

  useEffect(() => {
    if (typeof window === "undefined") return;
    setMainContentFunctions(open, close);
  }, [router.asPath, setMainContentFunctions, open, close]);
  
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
          h="100%"
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
            top: isDesktopAndUp ? 100 : 80,
            left: contentWidth,
            height: 55,
            width: 20,
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
            borderTopRightRadius="lg"
            borderBottomRightRadius="lg"
            border="1px solid"
            borderLeft="none"
            borderColor="cm.accentLight"
            transition="opacity 0.3"
            w="25px"
            minW="25px"
            h="55px"
            overflow="hidden"
            {...(isMenuOpen || isQuickSearchOpen
              ? {
                  opacity: 0,
                  pointerEvents: "none",
                }
              : {
                  opacity: buttonVisible ? 1 : 0,
                })}
            aria-hidden={isMenuOpen || isQuickSearchOpen ? "true": undefined}
          >
            <Box bg="#fff" w="35px" h="55px" transform="translateX(-5px)">
              <IconButton
                className="svgHover"
                paddingInlineStart="0"
                paddingInlineEnd="0"
                padding="0"
                border="none"
                bg="transparent"
                w="30px"
                minW="30px"
                h="55px"
                overflow="hidden"
                _hover={{
                  bg: "transparent",
                }}
                _active={{
                  bg: "transparent",
                }}
                _focus={{
                  bg: "#999",
                }}
                aria-label={toggleLabel}
                icon={<SVG type="large_chevron" width="24px" height="24px" />}
                p="0"
                color="cm.accentLight"
                onClick={toggle}
                transform={isDrawerOpen ? "rotate(180deg)" : "rotate(0deg)"}
                tabIndex={isMenuOpen || isQuickSearchOpen ? -1 : undefined}
                aria-hidden={isMenuOpen || isQuickSearchOpen ? "true" : undefined}
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
        aria-hidden={isMenuOpen || isQuickSearchOpen ? "true" : undefined}
        transformTemplate={({ translateX }: { translateX: any }) => {
          return `translateX(${translateX}) translateZ(0)`;
        }}
        {...(isDrawer
          ? {
              onTap: !isDrawerOpen
                ? (event: any) => {
                    if (isAnimationRunningRef.current || panActive.current || !isMainContentActive)
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
            <chakra.main
              ref={mainContentRef}
              className="mainContent"
              id="content"
              minH={
                isMobile
                  ? isVerticalContent
                    ? undefined
                    : "calc(100vh - 60px)"
                  : "calc(100vh - 80px)"
              }
            >
              {children}
            </chakra.main>
          </Box>
        </Box>
      </MotionBox>
    </>
  );
};
