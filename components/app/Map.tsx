import React, { useRef, useState, useEffect } from "react";
import { primaryInput } from "detect-it";

import { useAppTranslations, useIsBreakPoint } from "~/hooks";
import { motion } from "framer-motion";

import {
  useMapContext,
  useMenuButtonContext,
  useQuickSearchContext,
  useMainContentContext,
} from "~/provider";

import { Box, IconButton, Flex } from "@chakra-ui/react";
import { SVG } from "~/components/ui";
import type { CultureMap } from "~/services/CultureMap";

export const Map = () => {
  const { t } = useAppTranslations();

  const cultureMap = useMapContext();

  const mapContainer = useRef<HTMLDivElement>(null);
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
    if (cultureMapRef.current || !mapContainer.current || !cultureMap) return; 

    cultureMap.init(mapContainer.current, setMapLoaded);

    cultureMapRef.current = cultureMap;
  }, [setMapLoaded, cultureMap]);

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

  return (
    <>
      <Box
        className="map-wrap"
        position="fixed"
        zIndex="1"
        left="0"
        top="0"
        h="100vh"
        w="100vw"
        ref={buttonContainer}
        ariaHidden="true"
      >
        <Box ref={mapContainer} className="map" w="100%" h="100%" />
      </Box>

      <Box
        position="fixed"
        right={isTabletWide || isDesktopAndUp ? "20px" : "10px"}
        top={isDesktopAndUp ? "100px" : isTabletWide ? "80px" : "70px"}
        zIndex="1"
        transition="opacity 0.3s"
        opacity={
          mapLoaded
            ? isMainContentOpen && !(isTablet || isDesktopAndUp)
              ? 0
              : 1
            : 0
        }
        ariaHidden="true"
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
          {(isTabletWide || isDesktopAndUp) && (
            <Box
              position="relative"
              mb={buttonSpacing}
              w={buttonDiameter}
              h={buttonDiameter}
              borderRadius={buttonDiameter}
              layerStyle="blurredWhite"
            >
              <motion.div
                animate={{ opacity: isQuickSearchOpen ? 1 : 0 }}
                initial={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
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
                    aria-label={t("menu.button.togggleSearch", "Search")}
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
                  />
                </Box>
              </motion.div>
              <motion.div
                animate={{ opacity: isQuickSearchOpen ? 0 : 1 }}
                initial={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
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
                    aria-label={t("menu.button.togggleSearch", "Search")}
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
                  />
                </Box>
              </motion.div>
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
                onClick={() => {
                  alert("Fehlt! TODO:");
                }}
              />
            </Box>
          )}
        </Flex>
      </Box>
    </>
  );
};

export default Map;
