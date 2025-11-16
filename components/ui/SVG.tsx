import React from "react";
import { Box } from "@chakra-ui/react";
import Image from 'next/image';

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

type SVGBaseProps = {
  type: string;
  className?: string;
  alt?: string;
};

type SVGFixedSizeProps = SVGBaseProps & {
  width: number;
  height: number;
  fill?: false;
  objectFit?: never;
  wrapped?: never;
};

type SVGFillProps = SVGBaseProps & {
  fill: true;
  objectFit?: "contain" | "cover";
  width?: never;
  height?: never;
  wrapped?: never;
};

type SVGWrappedProps = SVGBaseProps & {
  width: number;
  height: number;
  wrapped: true;
  objectFit?: "contain" | "cover";
  fill?: boolean;
};

type SVGProps = SVGFixedSizeProps | SVGFillProps | SVGWrappedProps;

export const SVG = ({
  type,
  width,
  height,
  fill,
  objectFit,
  className = "svg",
  wrapped,
  alt
}: SVGProps) => {
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
  const Img = <Image
      className={className}
      alt={alt ?? ""}
      src={Component}
      width={!fill ? width : undefined}
      height={!fill ? height : undefined}
      style={{
        objectFit: objectFit ?? "contain",
      }}
      fill={fill}
    ></Image>
  
  return wrapped ? <Box sx={
                      {
                        "position": "relative",
                        "width": `${width}px`,
                        "height": `${height}px`,
                        "flexGrow": 0,
                        "flexShrink": 0
                      }
                    }>
                      {Img}
                    </Box> : Img;
};
