import {
  extendTheme,
  withDefaultVariant,
  withDefaultSize,
  withDefaultColorScheme,
} from "@chakra-ui/react";
import { createBreakpoints } from "@chakra-ui/theme-tools";
import { components } from "./components";

import { chakraToBreakpointArray } from "./helpers";

// https://smart-swatch.netlify.app/#b248bb

const themeConfig = {
  fonts: {
    heading: "Berlin Type",
    body: "Berlin Type",
  },
  components,
  breakpoints: createBreakpoints({
    // 16px default font size * ...em
    sm: "20em", // ~360px
    md: "45em", // ~720px
    lg: "62em", // ~992px
    xl:  "75em", // 1200px - aka "Desktop"
    xl2:  "120em", // ~1920px - aka "Screen"
  }),
  styles: {
    global: {
      "html, body": {
        color: "#333",
        margin: 0,
        padding: 0,
        height: "100%",
      },
      "select, option":
        "font-family: Berlin Type, Helvetica, Arial, sans-serif;",
      "#root": {
        height: "100%",
      },
      body: {
        minHeight: "100%",
        bg: "#fff",
        fontSize: chakraToBreakpointArray({
          sm: "18px",
          md: "21px",
          xl:  "21px",
        }),
        lineHeight: chakraToBreakpointArray({
          sm: "22px",
          md: "26px",
          xl:  "26px",
        }),
      },
      "h1, h2, h3, h4, h5, h6": {
        fontWeight: "bold",
        margin: "0 0 0.6em 0",
        lineHeight: chakraToBreakpointArray({
          sm: "25px",
          md: "31px",
          xl:  "31px",
        }),
        fontSize: chakraToBreakpointArray({
          sm: "22px",
          md: "28px",
          xl:  "28px",
        }),
        "&:last-child": {
          mb: "0",
        },
      },
      "h1.highlight": {
        fontSize: chakraToBreakpointArray({
          base: "12px !important",
          md: "18px !important",
          xl:  "18px !important",
        }),
        lineHeight: chakraToBreakpointArray({
          base: "17px !important",
          md: "22px !important",
          xl:  "22px !important",
        }),
        letterSpacing: chakraToBreakpointArray({
          base: "1.8px !important",
          md: "1.8px !important",
          xl:  "1.8px !important",
        }),
      },
      "ul, ol": {
        margin: "0 0 0.6em 1.25em",
        li: {
          paddingLeft: "0.2em",
          mb: "1",
          "&:last-child": {
            mb: "0",
          },
        },
        "&:last-child": {
          mb: "0",
        },
      },
      a: {
        transitionProperty: "common",
        transitionDuration: "fast",
        cursor: "pointer",
        textDecoration: "none",
        outline: "none",
        _hover: {
          textDecoration: "none",
        },
      },
      "a:not(.chakra-button)": {
        color: "wine.600",
        _hover: {
          color: "cm.accentDark",
        },
        // _focus: {
        //   "boxShadow": "outline"
        // }
      },
      "p a": {
        textDecoration: "underline",
      },
      p: {
        mb: "0.6em",
        "&:last-child": {
          mb: "0",
        },
      },
      "p + p > button": {
        mt: 2,
      },
    },
  },
  colors: {
    cm: {
      bgFooter: "#ddd",
      text: "#333",
      accentDark: "#660D36",
      accentLight: "#E42B20",
    },
  },
  shadows: {
    xs: "0 0 0 1px rgba(0, 0, 0, 0.05)",
    sm: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
    base: "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)",
    md: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
    xl:  "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
    xl2:  "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
    "2xl": "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
    outline: "0 0 0 2px rgba(228, 43, 32, 0.5)",
    "button-wine": "0 0 0 3px rgba(178, 72, 187, 0.6)",
    inner: "inset 0 2px 4px 0 rgba(0,0,0,0.06)",
    none: "none",
    "dark-lg":
      "rgba(0, 0, 0, 0.1) 0px 0px 0px 1px, rgba(0, 0, 0, 0.2) 0px 5px 10px, rgba(0, 0, 0, 0.4) 0px 15px 40px",
  },
  radii: {
    none: "0",
    sm: "0.125rem",
    base: "0.25rem",
    md: "0.25rem", // 0.375rem
    xl:  "0.5rem",
    xl2:  "0.75rem",
    "2xl": "1rem",
    "3xl": "1.5rem",
    full: "9999px",
  },
  layerStyles: {
    headingPullOut: {
      transform: {
        base: "translateX(-10px)",
        sm: "translateX(-10px)",
        md: "translateX(-30px)",
      }
    },
    blurredLightGray: {
      bg: "rgba(200,200,200,0.5)",
      backdropFilter: "blur(20px)",
      backgroundBlendMode: "lighten",
    },
    blurredWhite: {
      bg: "rgba(255,255,255,0.8)",
      backdropFilter: "blur(20px)",
      backgroundBlendMode: "lighten",
    },
    pageContainerWhite: {
      bg: "white",
      // borderRadius: "lg",
      shadow: "xl",
      p: { base: 4, md: 5 },
    },
    page: {
      minH: "60vh",
      pt: chakraToBreakpointArray({
        base: "7px",
        md: "17px",
      }),
      px: chakraToBreakpointArray({
        base: "20px",
        md: "45px",
        xl:  "55px",
      }),
      pb: chakraToBreakpointArray({
        base: "20px",
        md: "45px",
        xl:  "55px",
      }),
      bg: "linear-gradient(180deg, rgba(252,210,207,1) 0%, rgba(255,255,255,1) 35%, rgba(255,255,255,1) 100%)",     
    },
  },
  textStyles: {
    navigation: {
      fontSize: chakraToBreakpointArray({
        base: "17px",
        md: "17px",
        xl:  "17px",
      }),
      lineHeight: chakraToBreakpointArray({
        base: "17px",
        md: "17px",
        xl:  "17px",
      }),
      letterSpacing: chakraToBreakpointArray({
        base: "1.7px",
        md: "1.7px",
        xl:  "1.7px",
      }),
    },
    larger: {
      fontSize: chakraToBreakpointArray({
        base: "18px",
        md: "24px",
        xl:  "24px",
      }),
      lineHeight: chakraToBreakpointArray({
        base: "22px",
        md: "29px",
        xl:  "29px",
      }),
    },
    finePrint: {
      fontSize: chakraToBreakpointArray({
        base: "9px",
        md: "9px",
        xl:  "9px",
      }),
      lineHeight: chakraToBreakpointArray({
        base: "13px",
        md: "13px",
        xl:  "13px",
      }),
    },
    categories: {
      fontSize: chakraToBreakpointArray({
        base: "12px",
        md: "14px",
        xl:  "14px",
      }),
      lineHeight: chakraToBreakpointArray({
        base: "17px",
        md: "17px",
        xl:  "17px",
      }),
      letterSpacing: chakraToBreakpointArray({
        base: "1.8px",
        md: "1.8px",
        xl:  "1.8px",
      }),
    },
    categoriesHighlight: {
      fontSize: chakraToBreakpointArray({
        base: "12px",
        md: "18px",
        xl:  "18px",
      }),
      lineHeight: chakraToBreakpointArray({
        base: "17px",
        md: "22px",
        xl:  "22px",
      }),
      letterSpacing: chakraToBreakpointArray({
        base: "1.8px",
        md: "1.8px",
        xl:  "1.8px",
      }),
    },
    card: {
      fontSize: chakraToBreakpointArray({
        base: "16px",
        md: "21px",
        xl:  "21px",
      }),
      lineHeight: chakraToBreakpointArray({
        base: "20px",
        md: "26px",
        xl:  "26px",
      }),
    },
    logo: {
      fontWeight: "bold",
      fontSize: chakraToBreakpointArray({
        base: "22px",
        md: "22px",
        xl:  "24px",
      }),
      lineHeight: chakraToBreakpointArray({
        base: "22px",
        md: "22px",
        xl:  "24px",
      }),
    },
  },
};

const defaultPropsForFormComponentents = (components: string[]): object => {
  return {
    components: components.reduce((options, key) => {
      return {
        ...options,
        [key]: {
          defaultProps: {
            focusBorderColor: "gray.500",
            errorBorderColor: "red.400",
          },
        },
      };
    }, {}),
  };
};

export const chakraTheme = extendTheme(
  themeConfig,

  defaultPropsForFormComponentents([
    "Input",
    "Select",
    "Button",
    "NumberInput",
    "PinInput",
  ]),

  withDefaultColorScheme({
    colorScheme: "wine",
    components: ["Button", "Badge", "Checkbox", "Switch"],
  }),
  withDefaultVariant({
    variant: "solid",
    components: ["Button", "IconButton"],
  }),
  withDefaultVariant({
    variant: "outline",
    components: ["Input", "NumberInput", "PinInput"],
  }),
  withDefaultSize({
    size: "md",
    components: ["Input", "NumberInput", "PinInput", "Button", "Select"],
  })
);

export default chakraTheme;
