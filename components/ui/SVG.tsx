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
  let component = ArrowSVG;

  switch (type) {
    case "arrow-up":
      component = ArrowUpSVG;
      break;
    case "ba_lichtenberg":
      component = BALichtenberg;
      break;

    case "search":
      component = SearchSVG;
      break;

    case "menu-mobile":
      component = MenuMobileSVG;
      break;

    case "menu-tablet":
      component = MenuTabletSVG;
      break;

    case "cross":
      component = CrossSVG;
      break;

    case "suggestion":
      component = SuggestionSVG;
      break;

    case "location":
      component = WhereAmISVG;
      break;

    case "ok":
      component = OkSVG;
      break;

    case "plus":
      component = PlusSVG;
      break;

    case "minus":
      component = MinusSVG;
      break;

    case "accordion_1":
      component = Accordion1SVG;
      break;

    case "accordion_2":
      component = Accordion2SVG;
      break;

    case "chevron_right":
      component = ChrevronRightSVG;
      break;

    case "large_chevron":
      component = LargeChrevronSVG;
      break;
  }

  return (
    <Box
      className={className}
      w={width}
      h={height}
      flexShrink={0}
      backgroundPosition={position}
      backgroundRepeat="no-repeat"
      backgroundSize={size}
      backgroundImage={`url(${component})`}
    ></Box>
  );
};
