import React, {useState, useEffect} from "react";
import { useTranslation } from "next-i18next";

import { ActiveLink } from "~/components/ui";

import {
  Heading,
  Grid,
  Link,
  Avatar,
  Box,
  Icon,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  useMediaQuery,
} from "@chakra-ui/react";

import { InlineLanguageButtons } from "~/components/ui";

const menuLinkStyling = {
  bg:"#fff",
  color:"wine.500",
};

export const Header = (/* props */) => {
  const { t } = useTranslation();

  const [isMobile, setIsMobile] = useState(false)
  
  useEffect(() => {
    const media = window.matchMedia(`(min-width: 55em)`)
    
    // Check on mount (callback is not called until a change occurs)
    if (media.matches) {
      setIsMobile(false)
    } else {
      setIsMobile(true)
    }
  }, [])
  
  const avatarSize = !isMobile ? "md" : "sm";
  const showLogo = !isMobile ? "block" : "none";

  return (
    <Box
      m="0"
      pr={{ base: 3, tw: 4 }}
      pl={{ base: 3, tw: 4 }}
      position="fixed"
      w="100%"
      h="auto"
      top="0"
      minH="40px"
      zIndex="overlay"
      bg="white"
      shadow="md"
    >
      <Grid
        bg="white"
        gap={6}
        templateColumns={{ base: "32px 1fr 32px", tw: "260px 1fr 60px" }}
        alignItems="center"
        p={{ base: 2, tw: 3 }}
      >
        <Box>
          <Heading as="h2" ml="2">
            <Link
              display={showLogo}
              as={ActiveLink}
              activeClassName="active"
              href="/"
              color="black"
              textDecoration="none !important"
            >
              CultureMap
            </Link>
          </Heading>
        </Box>
        <Box w="200px" h="32px">
          {/* Search  TODO: create admin search */}
        </Box>
        <Box><InlineLanguageButtons /></Box>
      </Grid>
    </Box>
  );
};
