import React, { MouseEventHandler,useState, useEffect, useContext } from "react";
import {
  HiMenu,
  HiOutlineHome,
  HiOutlineDocumentText,
  HiOutlineLocationMarker,
} from "react-icons/hi";
import { RiCalendarEventLine } from "react-icons/ri";
import { IoSettingsOutline } from "react-icons/io5";
import { MdClose } from "react-icons/md";
import { default as RouterLink} from 'next/link'
import {
  Box,
  Link,
  Icon,
  useDisclosure,
  IconButton,
  chakra,
  useMediaQuery,
  Button,
} from "@chakra-ui/react";
import { useTranslation } from "next-i18next";
import { InlineLanguageButtons, ActiveLink } from "~/components/ui";
import { MapContext } from "~/provider";

const NavItem = ({
  title,
  path,
  icon,
  onClick,
}: {
  title: string;
  path: string;
  exact: boolean;
  icon: any;
  onClick: MouseEventHandler;
}) => {
  return (
    <Box>
      <Link
        as={ActiveLink}
        href={path}
        display="flex"
        alignItems="center"
        fontSize="lg"
        color="var(--chakra-colors-gray-800) !important"
        ml="-3px"
        pl="1"
        py="1"
        transition="all 0.3s"
        activeClassName="active"
        _hover={{
          textDecoration: "none",
          color: "var(--chakra-colors-wine-600) !important",
        }}
        sx={{
          "&.active": {
            color: "var(--chakra-colors-wine-600) !important",
          },
          "&.active .chakra-icon": {
            color: "var(--chakra-colors-wine-600) !important",
          },
        }}
        onClick={onClick}
      >
        <chakra.span><Icon as={icon} mr="2" />
        {title}</chakra.span>
      </Link>
    </Box>
  );
};

export const Sidebar = () => {
  const { t } = useTranslation();
  const { setPins } = useContext(MapContext);

  const [mounted, setMounted] = useState(false)
  const [tw] = useMediaQuery("(min-width: 55em)");

  useEffect(()=>{ 
    setMounted(true)
  },[])

  
  const isMobile = tw ? false : true;

  console.log(tw, isMobile, mounted);
  // TODO: fix sidebar to at least be desktop first ... 
  // https://github.com/chakra-ui/chakra-ui/issues/4319
  // >>> https://github.com/chakra-ui/chakra-ui/issues/3124


  const { isOpen, onToggle } = useDisclosure();

  const mainNavLinks = [
    {
      title: t("mainnav.home.title", "Home"),
      path: "/",
      exact: true,
      icon: HiOutlineHome,
    },
    {
      title: t("mainnav.locations.title", "Locations"),
      path: "/locations",
      exact: false,
      icon: HiOutlineLocationMarker,
    },
    {
      title: t("mainnav.events.title", "Events"),
      path: "/events",
      exact: false,
      icon: RiCalendarEventLine,
    },
    {
      title: t("mainnav.page.title", "Pages"),
      path: "/page/about-us",
      exact: false,
      icon: HiOutlineDocumentText,
    },
  ];

  return (
    <>
      {isMobile && (
        <IconButton
          bg="white"
          color="black"
          size="sm"
          position="fixed"
          top="4px"
          left="4"
          w="40px"
          h="40px"
          zIndex="toast"
          onClick={onToggle}
          icon={isOpen ? <MdClose /> : <HiMenu />}
          fontSize="30px"
          aria-label={
            isOpen ? t("menu.close", "Close menu") : t("menu.open", "Open menu")
          }
          _hover={{
            bg: "white",
          }}
        />
      )}
      <Box
        w="100%"
        maxW={{ base: "100%", tw: "calc(260px + 1rem)" }}
        className={`${isMobile ? "active" : "inactive"} ${
          !isOpen || !isMobile ? "closed" : "open"
        }`}
        transition="all 0.2s"
        pr={{ base: 3, tw: 0 }}
        pl={{ base: 3, tw: 4 }}
        pb={{ base: 3, tw: 4 }}
        position="sticky"
        top={{ base: "48px", tw: "72px" }}
        sx={{
          "&.active": {
            position: "fixed",
            transform: "translateX(-100%)",
            zIndex: "popover",
            bg: "white",
            top: 0,
            height: "100%",
            overflow: "auto",
          },
          "&.active > div": {
            shadow: "none",
          },
          "&.active.open": {
            transform: "translateX(0%)",
          },
        }}
      >
        <Box
          layerStyle="pageContainerWhite"
          mt={{ base: 12, tw: 4 }}
          w={{ base: "100%", tw: "260px" }}
        >
          {mainNavLinks.map((link) => {
            return <NavItem key={link.path} {...link} onClick={onToggle} />;
          })}

          <Box mt="8">
          <Button onClick={() => setPins([
  {lng: 52.536821,  lat: 13.514006},
  {lng: 52.522971,  lat: 13.492928},
  {lng: 52.517696,  lat: 13.437911},
  {lng: 52.529969,  lat: 13.472438},
  {lng: 52.522971, lat:  13.491897},

])} >SET PINS</Button>
          </Box>
        </Box>
      </Box>
    </>
  );
};
