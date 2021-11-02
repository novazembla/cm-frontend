import { useState, useRef, useEffect } from "react";
import { Box, IconButton, useBreakpointValue } from "@chakra-ui/react";
import { useAppTranslations, useIsBreakPoint } from "~/hooks";
import { HiChevronRight } from "react-icons/hi";
import { motion, useIsPresent, useAnimation } from "framer-motion";
import { useRouter } from "next/router";
import { useScrollStateContext } from "~/provider";
import { primaryInput } from "detect-it";
import { debounce } from "lodash";

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

  const [dragLeft, setDragLeft] = useState(0);

  const [isDrawerOpen, setIsDrawerOpen] = useState(true);
  const [isAnimationRunning, setIsAnimationRunning] = useState(false);
  const [eventListenerAdded, setEventListenerAdded] = useState(false);

  const controls = useAnimation();

  const isPresent = useIsPresent();

  const [animation, setAnimation] = useState({});

  const [isScrollingObserved, setIsScrollingObserved] = useState(false);

  const scrollState = useScrollStateContext();

  const { t } = useAppTranslations();

  const closeState = useBreakpointValue({
    base: "calc((-1 * (100vw - 20px)) + 40px)",
    sm: "calc((-1 * (90vw)) + 40px)",
    md: "calc((-1 * (80vw)) + 50px)",
    lg: "calc((-1 * 66.66vw) + 50px)",
    xl: "-625px",
  });

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
    if (typeof window === "undefined") return;

    // reset
    if (!isPresent) {
      const container: HTMLDivElement | null = document.querySelector(
        `.animatedMainContent:not(#p-${router.asPath.replace(/[^a-z]/g, "")})`
      );

      if (container) {
        const slug = container.getAttribute("id")?.replace("p-", "") ?? "-";
        if (isMobile) {
          console.log(2);
        } else {
          console.log(3, container, slug);
          // annoyinigly the clone of the component by framer motion's animate presence
          // reset the scoll state of the main content's div.
          // we have to reset it
          if (scrollState.get("main", slug) > 0) {
            console.log(4, container);

            const mc: HTMLDivElement | null =
              container.querySelector(".mainContent");

            if (mc) {
              console.log(slug, scrollState.get("main", slug));
              setTimeout(() => {
                mc.scrollTo({
                  top: scrollState.get("main", slug),
                  left: 0,
                });
              }, 20);
              setTimeout(() => {
                mc.scrollTo({
                  top: scrollState.get("main", slug),
                  left: 0,
                });
              }, 20);
            }
          }
        }
      }
    }
  }, [isPresent, router.asPath, isMobile, scrollState]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    if (isPresent) {
      console.log(
        "setting current router",
        router.asPath.replace(/[^a-z]/g, "")
      );

      if (isMobile) {
        if (
          scrollState.get("body", router.asPath.replace(/[^a-z]/g, "")) > 0 &&
          scrollState.isBack()
        ) {
          setTimeout(() => {
            window.scrollTo({
              top: scrollState.get(
                "main",
                router.asPath.replace(/[^a-z]/g, "")
              ),
              left: 0,
            });
          }, 20);
        } else {
          window.scrollTo({
            top: 0,
            left: 0,
          });
          scrollState.set("main", router.asPath.replace(/[^a-z]/g, ""), 0);
        }
      } else {
        if (
          scrollState.get("main", router.asPath.replace(/[^a-z]/g, "")) > 0 &&
          scrollState.isBack()
        ) {
          setTimeout(() => {
            mainContentRef.current?.scrollTo({
              top: scrollState.get(
                "main",
                router.asPath.replace(/[^a-z]/g, "")
              ),
              left: 0,
            });
          }, 20);
        } else {
          mainContentRef.current?.scrollTo({
            top: 0,
            left: 0,
          });
          scrollState.set("main", router.asPath.replace(/[^a-z]/g, ""), 0);
        }
      }

      scrollState.setIsBack(false);
    }
  }, [isPresent, router.asPath, isMobile, scrollState]);

  const close = () => {
    if (isAnimationRunning) return;
    setIsDrawerOpen(false);
    setIsAnimationRunning(true);

    panXRef.current = dragLeft * -1;
    controls.start({
      translateX: dragLeft * -1,
    });

    setTimeout(() => {
      setIsAnimationRunning(false);
    }, 250);
  };

  const open = () => {
    if (isAnimationRunning) return;
    setIsDrawerOpen(true);
    setIsAnimationRunning(true);

    controls.start({
      translateX: 0,
    });

    setTimeout(() => {
      setIsAnimationRunning(false);
    }, 250);
  };

  const onResize = debounce(() => {
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
      dL = window.innerWidth * 0.9 - 50;
    } else if (isTablet && !isTabletWide) {
      dL = window.innerWidth * 0.8 - 50;
    } else if (isTabletWide) {
      dL = window.innerWidth * 0.666 - window.innerWidth * 0.1;
    } else if (isDesktop) {
      dL = 655;
    } else {
      dL = 695 + (window.innerWidth * 0.08 - 55) - 100;
    }

    console.log(isMobile, isTablet, isTabletWide, isDesktop, dL);

    setDragLeft(dL);

    setIsDrawerOpen(true);
    panXRef.current = 0;
    controls.start({
      translateX: panXRef.current,
    });
  }, 350);

  useEffect(() => {
    if (typeof window === "undefined" || eventListenerAdded) return;

    setEventListenerAdded(true);

    window.addEventListener("resize", onResize);
    onResize();

    return () => {
      if (typeof window === "undefined") return;
      window.removeEventListener("resize", onResize);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

    console.log("isDrawerOpne", isDrawerOpen);
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
          bg="#ff0"
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
          animate={controls}
          transition={{
            duration: 0.3,
            bounce: false,
          }}
          transformTemplate={({ translateX }) => {
            return `translateX(${translateX})`;
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
      {/* TODO: "&:active": {
            cursor: "grab",
          }, */}
      <motion.div
        key={`drawer-${router.asPath}`}
        style={{
          position: "absolute",
          top: isVerticalContent
            ? "calc(100vh - var(--locationBarHeight) - 235px)"
            : 0,
          left: contentLeft,
          height: isVerticalContent ? "auto" : "100vh",
          width: isVerticalContent ? "100vw" : contentWidth,
          zIndex: 2,
          touchAction: "pan-y",
          cursor: !isDrawerOpen ? "pointer" : undefined,
        }}
        transformTemplate={({ translateX }) => {
          return `translateX(${translateX})`;
        }}
        {...(isDrawer
          ? {
              onTap: !isDrawerOpen
                ? (event, info) => {
                    event.preventDefault();
                    toggle();
                  }
                : undefined,

              onPanStart: (event, info) => {
                if (!panXRef.current) {
                  panXRef.current = 0;
                }
              },

              onPan: (event, info) => {
                if (isAnimationRunning) return;
                // panXRef.current = Math.min(
                //   0,
                //   Math.max(dragLeft * -1, panXRef.current + info.offset.x)
                // );
                
                // console.log("p1", dragLeft * -1, panXRef.current, info.offset.x, panXRef.current + info.offset.x);

                if (!isDrawerOpen) {
                  console.log(2);
                  if (info.offset.x > 30) {
                    console.log(3);
                    open();
                  } else {
                    
                    console.log(4)
                    controls.start({
                      translateX: info.offset.x,
                    });
                  }
                  
                } else {
                  console.log(5)
                  controls.start({
                    translateX: info.offset.x,
                  });
                }
                
              },
              onPanEnd: (event, info) => {
                if (isAnimationRunning) return;
                
                console.log("panend", info.offset.x)
                if (Math.abs(info.offset.x) > dragLeft * 0.25) {
                  if (info.offset.x < 0) {
                    console.log("trigger close");
                    close();
                  } else {
                    console.log("trigger open");
                    open();
                  }
                } else {
                  if (info.offset.x < 0) {
                    console.log("trigger reopen");
                    open();
                  } else {
                    console.log("trigger reclose");
                    close();
                  }
                }
                
              },
              //initial: animation,
              animate: controls,

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
                  console.log(
                    router.asPath.replace(/[^a-z]/g, ""),
                    (e.target as any).scrollTop
                  );
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
