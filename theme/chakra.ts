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
// https://codepen.io/sosuke/pen/Pjoqqp

const themeConfig = {
  initialColorMode: "light",
  useSystemColorMode: false,
  fonts: {
    heading: "Berlin Type",
    body: "Berlin Type",
  },
  components,
  breakpoints: createBreakpoints({
    // 16px default font size * ...em
    sm: "21em", // ~360px
    md: "45em", // ~720px
    lg: "62em", // ~992px
    xl: "75em", // 1200px - aka "Desktop"
    "2xl": "120em", // ~1920px - aka "Screen"
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
      ".motionDragContainer": {
        _active: {
          cursor: "grabbing !important",
        },
      },
      body: {
        bg: "#fff",
        fontSize: chakraToBreakpointArray({
          sm: "18px",
          md: "21px",
          xl: "21px",
        }),
        lineHeight: chakraToBreakpointArray({
          sm: "22px",
          md: "26px",
          xl: "26px",
        }),
      },
      "h1, h2, h3, h4, h5, h6": {
        fontWeight: "bold",
        margin: "0 0 0.6em 0",
        lineHeight: chakraToBreakpointArray({
          sm: "25px",
          md: "31px",
          xl: "31px",
        }),
        fontSize: chakraToBreakpointArray({
          sm: "22px",
          md: "28px",
          xl: "28px",
        }),
        "&:last-child": {
          mb: "0",
        },
      },
      "h1.highlight,h2.highlight,h3.highlight,.highlight": {
        fontSize: chakraToBreakpointArray({
          base: "13px !important",
          md: "18px !important",
          xl: "18px !important",
        }),
        lineHeight: chakraToBreakpointArray({
          base: "17px !important",
          md: "22px !important",
          xl: "22px !important",
        }),
        letterSpacing: chakraToBreakpointArray({
          base: "1.8px !important",
          md: "1.8px !important",
          xl: "1.8px !important",
        }),
        textTransform: "uppercase",
        fontWeight: "bold",
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
        textDecoration: "underline",
        textDecorationColor: "cm.accentLight",
        outline: "none",
        _hover: {
          color: "cm.accentDark",
          textDecorationColor: "cm.accentDark",
        },
        transition: "all 0.3s !important",
        "&.active": {
          fontWeight: "bold",
          color: "cm.accentDark",
          textDecorationColor: "cm.accentDark",
        },
      },
      "p a": {
        textDecoration: "underline",
        textDecorationColor: "cm.accentLight",
        _hover: {
          color: "cm.accentDark",
          textDecorationColor: "cm.accentDark",
        },
      },
      "#__next": {
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
      ".chakra-linkbox__overlay::before": {
        zIndex: "1 !important",
      },
      ".translationMissing": {
        color: "#999"
      },
      ".tabbed a:focus": {
        outline: "solid 2px #E42B20",
        outlineOffset: "5px"
      },
    },
  },
  colors: {
    blur: {
      gray: "rgba(180,180,180,0.95)",
      blurredGray: "rgba(180,180,180,0.65)",
      white: "rgba(255, 255, 255, 0.95)",
      blurredWhite: "rgba(255,255,255,0.75)",
    },
    cm: {
      bgFooter: "#ddd",
      text: "#333",
      accentDark: "#660D36",
      // from black to accentDark: filter: invert(13%) sepia(17%) saturate(7488%) hue-rotate(306deg) brightness(99%) contrast(106%);
      accentLight: "#E42B20",
      // from black to accentLight: filter: invert(18%) sepia(82%) saturate(4434%) hue-rotate(355deg) brightness(96%) contrast(85%);

      50: "#ffe5e4",
      100: "#fcbcb9",
      200: "#f3928c",
      300: "#ed675f",
      400: "#e63c32",
      500: "#cd2319",
      600: "#a01a12",
      700: "#73100c",
      800: "#470805",
      900: "#1f0000",
    },
  },
  shadows: {
    xs: "0 0 0 1px rgba(0, 0, 0, 0.05)",
    sm: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
    base: "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)",
    md: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
    xl: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
    xxl: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
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
    xl: "0.5rem",
    xxl: "0.75rem",
    "2xl": "1rem",
    "3xl": "1.5rem",
    full: "9999px",
  },
  layerStyles: {
    headingPullOut: {
      transform: {
        base: "translateX(-10px)",
        sm: "translateX(-10px)",
        md: "translateX(-25px)",
        "2xl": "translateX(-35px)",
      },
    },
    lightGray: {
      bg: "var(--chakra-colors-blur-gray)",
    },
    blurredLightGray: {
      bg: "var(--chakra-colors-blur-blurredGray)",
      backdropFilter: "blur(20px)",
      backgroundBlendMode: "lighten",
      backgroundAttachmend: "fixed",
    },
    blurredWhite: {
      bg: "var(--chakra-colors-blur-blurredWhite)",
      backdropFilter: "blur(20px)",
      backgroundBlendMode: "lighten",
      backgroundAttachmend: "fixed",
    },
    pageContainerWhite: {
      bg: "white",
      // borderRadius: "lg",
      shadow: "xl",
      p: { base: "20px", md: "45px", "2xl": "55px" },
    },
    page: {
      pt: chakraToBreakpointArray({
        base: "7px",
        md: "17px",
      }),
      px: chakraToBreakpointArray({
        base: "20px",
        md: "45px",
        "2xl": "55px",
      }),
      pb: chakraToBreakpointArray({
        base: "20px",
        md: "45px",
        "2xl": "55px",
      }),
    },
    pageBg: {
      bg: "linear-gradient(180deg, rgba(252,210,207,1) 0%, rgba(255,255,255,1) 300px, rgba(255,255,255,1) 100%) fixed",
      backgroundAttachment: "fixed",
    },
  },
  textStyles: {
    navigation: {
      fontSize: chakraToBreakpointArray({
        base: "17px",
        md: "17px",
        xl: "17px",
      }),
      lineHeight: chakraToBreakpointArray({
        base: "17px",
        md: "17px",
        xl: "17px",
      }),
      letterSpacing: chakraToBreakpointArray({
        base: "1.7px",
        md: "1.7px",
        xl: "1.7px",
      }),
    },
    headline: {
      fontSize: chakraToBreakpointArray({
        base: "22px",
        md: "28px",
        xl: "28px",
      }),
      lineHeight: chakraToBreakpointArray({
        base: "25px",
        md: "31px",
        xl: "31px",
      }),
    },
    larger: {
      fontSize: chakraToBreakpointArray({
        base: "18px",
        md: "24px",
        xl: "24px",
      }),
      lineHeight: chakraToBreakpointArray({
        base: "22px",
        md: "29px",
        xl: "29px",
      }),
    },
    finePrint: {
      fontSize: chakraToBreakpointArray({
        base: "10px",
        md: "12px",
        xl: "12px",
      }),
      lineHeight: chakraToBreakpointArray({
        base: "15px",
        md: "18px",
        xl: "18px",
      }),
    },
    formOptions: {
      fontSize: chakraToBreakpointArray({
        base: "15px",
        md: "17px",
        xl: "17px",
      }),
      lineHeight: chakraToBreakpointArray({
        base: "19px",
        md: "21px",
        xl: "21px",
      }),
    },
    categories: {
      fontSize: chakraToBreakpointArray({
        base: "13px",
        md: "14px",
        xl: "14px",
      }),
      lineHeight: chakraToBreakpointArray({
        base: "17px",
        md: "17px",
        xl: "17px",
      }),
      letterSpacing: chakraToBreakpointArray({
        base: "1.8px",
        md: "1.8px",
        xl: "1.8px",
      }),
    },

    calendar: {
      fontSize: chakraToBreakpointArray({
        base: "13px",
        md: "17px",
      }),
      lineHeight: chakraToBreakpointArray({
        base: "13px",
        md: "17px",
      }),
    },

    categoriesHighlight: {
      fontSize: chakraToBreakpointArray({
        base: "13px",
        md: "18px",
        xl: "18px",
      }),
      lineHeight: chakraToBreakpointArray({
        base: "17px",
        md: "22px",
        xl: "22px",
      }),
      letterSpacing: chakraToBreakpointArray({
        base: "1.8px",
        md: "1.8px",
        xl: "1.8px",
      }),
      textTransform: "uppercase",
    },
    card: {
      fontSize: chakraToBreakpointArray({
        base: "16px",
        md: "21px",
        xl: "21px",
      }),
      lineHeight: chakraToBreakpointArray({
        base: "20px",
        md: "26px",
        xl: "26px",
      }),
    },
    logo: {
      fontWeight: "bold",
      fontSize: chakraToBreakpointArray({
        base: "22px",
        md: "28px",
        xl: "30px",
        "2xl": "32px",
      }),
      lineHeight: chakraToBreakpointArray({
        base: "22px",
        md: "28px",
        xl: "30px",
        "2xl": "32px",
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
            focusBorderColor: "cm.accentDark",
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
    colorScheme: "cm",
    components: ["Button", "Badge", "Checkbox", "Switch", "Radio"],
  }),
  withDefaultVariant({
    variant: "solid",
    components: ["Button", "IconButton"],
  }),
  withDefaultVariant({
    variant: "outline",
    components: ["Input", "NumberInput", "PinInput",  "Textarea"],
  }),
  withDefaultSize({
    size: "md",
    components: ["Input", "NumberInput",  "Textarea", "PinInput", "Button", "Select"],
  })
);

export default chakraTheme;
