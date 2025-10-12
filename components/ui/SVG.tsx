import React from "react";
import { Box } from "@chakra-ui/react";

import ArrowSVG from "~/assets/svg/v2/arrow_right.svg";
import ArrowUpSVG from "~/assets/svg/v2/arrow_up.svg";
import SearchSVG from "~/assets/svg/v2/search.svg";
import MenuMobileSVG from "~/assets/svg/v2/menu_mobile.svg";
import MenuTabletSVG from "~/assets/svg/v2/menu_tablet.svg";
import CrossSVG from "~/assets/svg/v2/cross.svg";
import WhereAmISVG from "~/assets/svg/v2/location.svg";
import SuggestionSVG from "~/assets/svg/v2/suggestion.svg";
import OkSVG from "~/assets/svg/v2/ok.svg";
import PlusSVG from "~/assets/svg/v2/plus.svg";
import MinusSVG from "~/assets/svg/v2/minus.svg";
import Accordion1SVG from "~/assets/svg/v2/accordion_level_1.svg";
import Accordion2SVG from "~/assets/svg/v2/accordion_level_2.svg";
import ChrevronRightSVG from "~/assets/svg/v2/chevron_right.svg";
import LargeChrevronSVG from "~/assets/svg/v2/large_chevron.svg";
import BALichtenberg from "~/assets/svg/logo_ba_lichtenberg.svg";
import SenatEnergie from "~/assets/svg/logo_senat_energie.svg";

export const SVG = ({
  type,
  width,
  height,
  className = "svg",
  size = "contain",
  position = "center center",
}: {
  type: string;
  width: string;
  height: string;
  size?: string;
  className?: string;
  position?: string;
}) => {
  let Component = ArrowSVG;

  switch (type) {
    case "arrow-up":
      Component = ArrowUpSVG;
      break;
    case "ba_lichtenberg":
      Component = BALichtenberg;
      break;

    case "search":
      Component = SearchSVG;
      break;

    case "menu-mobile":
      Component = MenuMobileSVG;
      break;

    case "menu-tablet":
      Component = MenuTabletSVG;
      break;

    case "cross":
      Component = CrossSVG;
      break;

    case "suggestion":
      Component = SuggestionSVG;
      break;

    case "location":
      Component = WhereAmISVG;
      break;

    case "ok":
      Component = OkSVG;
      break;

    case "plus":
      Component = PlusSVG;
      break;

    case "minus":
      Component = MinusSVG;
      break;

    case "accordion_1":
      Component = Accordion1SVG;
      break;

    case "accordion_2":
      Component = Accordion2SVG;
      break;

    case "chevron_right":
      Component = ChrevronRightSVG;
      break;

    case "large_chevron":
      Component = LargeChrevronSVG;
      break;
    
    case "s_energie":
      Component = SenatEnergie;
      break;


  }

  return (
    // <Box className={className} as={Component} w={width} h={height} />
    <Box
      className={className}
      w={width}
      h={height}
      flexShrink={0}
      backgroundPosition={position}
      backgroundRepeat="no-repeat"
      backgroundSize={size}
      backgroundImage={`url(${Component})`}
    ></Box>
  );
};
