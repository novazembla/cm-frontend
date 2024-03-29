import React, { useRef, useState, useEffect } from "react";
import { primaryInput } from "detect-it";

import { useIsBreakPoint } from "~/hooks/useIsBreakPoint";
import { useAppTranslations } from "~/hooks/useAppTranslations";

import {
  useMapContext,
  useMenuButtonContext,
  useQuickSearchContext,
  useMainContentContext,
  useConfigContext,
} from "~/provider";

import { Box, IconButton, Flex } from "@chakra-ui/react";
import { SVG } from "~/components/ui/SVG";
import type { CultureMap } from "~/services/CultureMap";

const userGeoLocationOptions = {
  enableHighAccuracy: true,
  maximumAge: 30000,
  timeout: 27000,
};

export const Map = ({ layout }: { layout: string }) => {
  const { t } = useAppTranslations();

  const cultureMap = useMapContext();
  const config = useConfigContext();

  const mapContainer = useRef<HTMLDivElement>(null);
  const geolocationButton = useRef<HTMLButtonElement>(null);
  const buttonContainer = useRef<HTMLDivElement>(null);
  const cultureMapRef = useRef<CultureMap>();

  const { onMenuToggle, isMenuOpen } = useMenuButtonContext();
  const { isQuickSearchOpen, onQuickSearchToggle } = useQuickSearchContext();
  const { isMainContentOpen } = useMainContentContext();

  const { isMobile, isTablet, isTabletWide, isDesktopAndUp } =
    useIsBreakPoint();

  const buttonDiameter = isMobile ? "38px" : "55px";
  const buttonSpacing = isMobile ? "10px" : "14px";
  const [mapLoaded, setMapLoaded] = useState(false);

  useEffect(() => {
    let mounted = true;
    if (cultureMapRef.current || !mapContainer.current || !cultureMap) return;

    cultureMap.init(
      mapContainer.current,
      (state: boolean) => {
        if (mounted) setMapLoaded(state);
      },
      layout === "light"
    );

    cultureMapRef.current = cultureMap;
    return () => {
      mounted = false;
    };
  }, [setMapLoaded, cultureMap, layout]);

  useEffect(() => {
    const onWheel = (e: MouseEvent) => e.preventDefault();
    const ref = buttonContainer.current;
    if (typeof window !== undefined && ref) {
      ref.addEventListener("wheel", onWheel, { passive: false });
    }

    return () => {
      if (typeof window !== undefined && ref) {
        ref.removeEventListener("wheel", onWheel);
      }
    };
  }, []);

  const geoLocationWatchIdRef = useRef(0);

  const [geolocationActive, setGeolocationActive] = useState(false);
  const [geolocationFirstPosition, setGeolocationFirstPosition] =
    useState(false);

  const geolocationError = (err: GeolocationPositionError) => {
    console.error(err);
    setGeolocationActive(false);
    setGeolocationFirstPosition(false);
    cultureMap?.clearUserLocation();
  };

  const geolocationUpdate = (position: GeolocationPosition) => {
    if (position?.coords?.longitude && position?.coords?.latitude) {
      if (
        position?.coords?.longitude >= config.bounds[0][0] &&
        position?.coords?.longitude <= config.bounds[1][0] &&
        position?.coords?.latitude >= config.bounds[0][1] &&
        position?.coords?.latitude <= config.bounds[1][1]
      ) {

        cultureMap?.setUserLocation(
          position?.coords?.longitude,
          position?.coords?.latitude
        );
        if (!geolocationFirstPosition) {
          cultureMap?.panTo(
            position?.coords?.longitude,
            position?.coords?.latitude
          );
          setGeolocationFirstPosition(true);
        }
      } else {
        setGeolocationActive(false);
        setGeolocationFirstPosition(false);
        cultureMap?.clearUserLocation();
        if (geoLocationWatchIdRef.current !== 0) {
          if ("geolocation" in navigator)
            navigator.geolocation.clearWatch(geoLocationWatchIdRef.current);
          geoLocationWatchIdRef.current = 0;
        }
      }
    }
  };

  const geolocationToggle = () => {
    if (geolocationActive) {
      if (geoLocationWatchIdRef.current !== 0) {
        if ("geolocation" in navigator)
          navigator.geolocation.clearWatch(geoLocationWatchIdRef.current);
        geoLocationWatchIdRef.current = 0;
      }
      setGeolocationActive(false);
      setGeolocationFirstPosition(false);
      cultureMap?.clearUserLocation();
    } else {
      setGeolocationActive(true);
      setGeolocationFirstPosition(false);
      if (geoLocationWatchIdRef.current !== 0) {
        if ("geolocation" in navigator)
          navigator.geolocation.clearWatch(geoLocationWatchIdRef.current);
        geoLocationWatchIdRef.current = 0;
      }

      if ("geolocation" in navigator) {
        geoLocationWatchIdRef.current = navigator.geolocation.watchPosition(
          geolocationUpdate,
          geolocationError,
          userGeoLocationOptions
        );
      }
    }
    geolocationButton.current?.blur();
  };

  const buttonVisible = mapLoaded
    ? layout === "light" ||
      (!isMainContentOpen && !(isTablet || isDesktopAndUp)) ||
      isTablet ||
      isDesktopAndUp
    : false;
  return (
    <>
      <Box
        position="fixed"
        right={isTabletWide || isDesktopAndUp ? "20px" : "10px"}
        top={
          layout === "light"
            ? isTabletWide || isDesktopAndUp
              ? "20px"
              : "10px"
            : isDesktopAndUp
            ? "100px"
            : isTabletWide
            ? "80px"
            : "70px"
        }
        zIndex="2"
        transition="opacity 0.3s"
        opacity={buttonVisible ? 1 : 0}
        pointerEvents={buttonVisible ? undefined : "none"}
        aria-hidden="true"
        role="presentation"
      >
        <Flex
          direction="column"
          sx={{
            div: {
              _last: {
                mb: 0,
              },
            },
          }}
        >
          {(isTabletWide || isDesktopAndUp) && layout !== "light" && (
            <Box
              position="relative"
              mb={buttonSpacing}
              w={buttonDiameter}
              h={buttonDiameter}
              borderRadius={buttonDiameter}
              layerStyle="blurredWhite"
            >
              <Box
                opacity={isQuickSearchOpen ? 1 : 0 }
                transition="opacity 0.3s"
              >
                <Box
                  position="absolute"
                  top="0"
                  left="0"
                  w={buttonDiameter}
                  h={buttonDiameter}
                  zIndex={isQuickSearchOpen ? 2 : 1}
                  sx={{
                    touchAction: "none",
                  }}
                >
                  <IconButton
                    variant="outline"
                    aria-label={t("menu.button.openSearch", "Open search")}
                    icon={
                      <SVG
                        type="cross"
                        width={buttonDiameter}
                        height={buttonDiameter}
                      />
                    }
                    borderRadius="100"
                    p="0"
                    paddingInlineStart="0"
                    paddingInlineEnd="0"
                    w={buttonDiameter}
                    h={buttonDiameter}
                    bg="transparent"
                    onClick={() => {
                      onQuickSearchToggle();
                    }}
                    pointerEvents={isQuickSearchOpen ? undefined : "none"}
                    tabIndex={isQuickSearchOpen ? undefined : -1}
                    aria-controls="search"
                    aria-haspopup="true"
                    aria-expanded="true"
                    aria-hidden={isQuickSearchOpen ? undefined : "true" }
                  />
                </Box>
              </Box>
              <Box
                opacity={isQuickSearchOpen ? 0 : 1 }
                transition="opacity 0.3s"
              >
                <Box
                  position="absolute"
                  top="0"
                  left="0"
                  w={buttonDiameter}
                  h={buttonDiameter}
                  zIndex={isQuickSearchOpen ? 1 : 2}
                  sx={{
                    touchAction: "none",
                  }}
                >
                  <IconButton
                    variant="outline"
                    aria-label={t("menu.button.closeSearch", "Close search")}
                    icon={
                      <SVG
                        type="search"
                        width={buttonDiameter}
                        height={buttonDiameter}
                      />
                    }
                    borderRadius="100"
                    p="0"
                    paddingInlineStart="0"
                    paddingInlineEnd="0"
                    bg="transparent"
                    w={buttonDiameter}
                    h={buttonDiameter}
                    onClick={() => {
                      if (isMenuOpen && !isQuickSearchOpen) {
                        onMenuToggle();
                      }
                      onQuickSearchToggle();
                    }}
                    pointerEvents={isQuickSearchOpen ? "none" : undefined}
                    tabIndex={isQuickSearchOpen ? -1 : undefined}
                    aria-controls="search"
                    aria-haspopup="true"
                    aria-expanded="false"
                    aria-hidden={isQuickSearchOpen ? "true" : undefined}
                    
                  />
                </Box>
              </Box>
            </Box>
          )}

          <Box
            mb={buttonSpacing}
            w={buttonDiameter}
            h={buttonDiameter}
            borderRadius={buttonDiameter}
            layerStyle="blurredWhite"
            sx={{
              touchAction: "none",
            }}
          >
            <IconButton
              variant="outline"
              aria-label={t("menu.button.zoomIntoMap", "Zoom in")}
              icon={
                <SVG
                  type="plus"
                  width={buttonDiameter}
                  height={buttonDiameter}
                />
              }
              borderRadius="100"
              p="0"
              paddingInlineStart="0"
              paddingInlineEnd="0"
              w={buttonDiameter}
              h={buttonDiameter}
              bg="transparent"
              onClick={() => {
                if (cultureMapRef?.current?.map)
                  cultureMapRef.current.map.zoomIn({ duration: 1000 });
              }}
            />
          </Box>
          <Box
            mb={buttonSpacing}
            w={buttonDiameter}
            h={buttonDiameter}
            borderRadius={buttonDiameter}
            layerStyle="blurredWhite"
            sx={{
              touchAction: "none",
            }}
          >
            <IconButton
              variant="outline"
              aria-label={t("menu.button.zoomOutOfMap", "Zoom out")}
              icon={
                <SVG
                  type="minus"
                  width={buttonDiameter}
                  height={buttonDiameter}
                />
              }
              borderRadius="100"
              p="0"
              paddingInlineStart="0"
              paddingInlineEnd="0"
              w={buttonDiameter}
              h={buttonDiameter}
              bg="transparent"
              onClick={() => {
                if (cultureMapRef?.current?.map)
                  cultureMapRef.current.map.zoomOut({ duration: 1000 });
              }}
            />
          </Box>
          {isMobile && primaryInput === "touch" && (
            <Box
              mb={buttonSpacing}
              w={buttonDiameter}
              h={buttonDiameter}
              borderRadius={buttonDiameter}
              layerStyle="blurredWhite"
              sx={{
                touchAction: "none",
              }}
            >
              <IconButton
                ref={geolocationButton}
                variant="outline"
                aria-label={t("menu.button.findMyLocation", "Find my location")}
                icon={
                  <SVG
                    type="location"
                    width={buttonDiameter}
                    height={buttonDiameter}
                  />
                }
                borderRadius="100"
                p="0"
                paddingInlineStart="0"
                paddingInlineEnd="0"
                w={buttonDiameter}
                h={buttonDiameter}
                bg="transparent"
                sx={
                  geolocationActive
                    ? { shadow: "0 0px 3px 1px #E42B20", bg: "white" }
                    : {}
                }
                onClick={geolocationToggle}
              />
            </Box>
          )}
        </Flex>
      </Box>
      <Box
        className="map-wrap"
        position="fixed"
        zIndex="1"
        left="0"
        top="0"
        h="100vh"
        w="100vw"
        ref={buttonContainer}
        aria-hidden="true"
        tabIndex={-1}
        role="presentation"
      >
        <Box
          ref={mapContainer}
          position="relative"
          className="map"
          w="100%"
          h="100%"
          tabIndex={-1}
        />
      </Box>
    </>
  );
};

export default Map;
