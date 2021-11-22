import { useState, useEffect, useCallback, useRef } from "react";
import Cookies from "js-cookie";

import { useRouter } from "next/router";
import { useConfigContext } from "~/provider";
import { Button, Box, chakra, Flex } from "@chakra-ui/react";
import { useAppTranslations } from "~/hooks";

const COOKIE_NAME = "cm-allow-tracking";
import FocusLock from "react-focus-lock";

export const UserTracking = () => {
  const config = useConfigContext();
  const { t } = useAppTranslations();
  const [trackUser, setTrackUser] = useState(false);
  const [scriptAdded, setScriptAdded] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [fadingOut, setFadeingOut] = useState(false);
  const router = useRouter();

  const trackUserRef = useRef(false);

  const trackView = useCallback((url: any) => {
    if ((window as any)?.umami && trackUserRef.current) {
      (window as any).umami.trackView(url);
    } else {
      const trackUser = Cookies.get(COOKIE_NAME);

      if (trackUser !== "yes" && trackUser !== "no") {
        setShowPopup(true);
      }
    }
  }, []);

  const fadeOut = () => {
    setFadeingOut(true);
    setTimeout(() => {
      setShowPopup(false);
    }, 750);
  };

  useEffect(() => {
    const tEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setShowPopup(false);
      }
    };

    if (typeof document !== "undefined") {
      document.body.addEventListener("keyup", tEscape);
    }

    router.events.on("routeChangeComplete", trackView);
    return () => {
      if (typeof document !== "undefined") {
        document.body.removeEventListener("keyup", tEscape);
      }
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const trackUser = Cookies.get(COOKIE_NAME);

    if (trackUser === "yes") {
      setTrackUser(true);
      trackUserRef.current = true;
    } else if (trackUser !== "no") {
      setShowPopup(true);
    }
  }, [setTrackUser, setShowPopup]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    if (trackUser && !scriptAdded) {
      if (config.umamiId && config.umamiUrl) {
        var script = document.createElement("script");
        script.src = config.umamiUrl;
        script.async = true;
        script.setAttribute("data-website-id", config.umamiId);
        script.setAttribute("data-auto-track", "false");

        script.onload = () => {
          trackView(
            `${
              router.defaultLocale !== router.locale ? `/${router.locale}` : ""
            }${router.asPath}`
          );
        };

        document.head.appendChild(script);
      }

      setScriptAdded(true);
    }
  }, [
    trackUser,
    scriptAdded,
    config.umamiUrl,
    config.umamiId,
    router.defaultLocale,
    router.locale,
    router.asPath,
    trackView,
  ]);

  return (
    <>
      {showPopup && (
        <FocusLock autoFocus={false}>
          <chakra.aside
            layerStyle="blurredWhite"
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="cpopup_label"
            aria-describedby="cpopup_desc"
            position="fixed"
            top={{
              base: "70px",
              md: "auto",
            }}
            bottom={{
              md: "0px",
            }}
            left={{
              base: "10px",
              md: "0px",
            }}
            w={{
              base: "calc(100% - 20px)",
              md: "100%",
            }}
            h={{
              base: "calc(100% - 160px)",
              md: "auto",
            }}
            zIndex="1000"
            transition="opacity 0.5s"
            opacity={fadingOut ? 0 : 1}
          >
            <Flex
              p={{
                base: "20px",
                md: "35px",
              }}
              flexDirection={{
                base: "column",
                md: "row",
              }}
              justifyContent={{
                base: "flex-end",
                md: "space-between",
              }}
              alignItems={{
                md: "center",
              }}
              h="100%"
              maxW="1000px"
              mx="auto"
            >
              <Box
                pb={{
                  base: "2em",
                  md: "0",
                }}
                pr={{
                  base: "0",
                  md: "35px",
                }}
              >
                <chakra.h2 id="cpopup_label" textStyle="larger">
                  {t("trackingPopup.title", "Usage statistics")}
                </chakra.h2>
                <Box id="cpopup_desc">
                  <p>
                    {t(
                      "trackingPopup.desc",
                      "To be able to improve our services we'd like to anonymously record the individual pages you're visiting."
                    )}
                  </p>
                </Box>
              </Box>
              <Box
                my={{
                  base: "2em",
                  md: "1em",
                }}
              >
                <Flex flexDirection="column">
                  <Button
                    onClick={() => {
                      Cookies.set(COOKIE_NAME, "no");
                      setTrackUser(false);
                      trackUserRef.current = false;
                      fadeOut();
                    }}
                    variant="ghost"
                    minW="160px"
                    mx="auto"
                    mb="1em"
                  >
                    {t("trackingPopup.buttonNo", "No, thanks")}
                  </Button>
                  <Button
                    onClick={() => {
                      Cookies.set(COOKIE_NAME, "yes");
                      setTrackUser(true);
                      trackUserRef.current = true;
                      fadeOut();
                    }}
                    variant="ghost"
                    minW="160px"
                    mx="auto"
                  >
                    {t("trackingPopup.buttonYes", "Okay")}
                  </Button>
                </Flex>
              </Box>
            </Flex>
          </chakra.aside>
        </FocusLock>
      )}
    </>
  );
};
