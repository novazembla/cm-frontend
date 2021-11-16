// Defaults are defined here:
// https://github.com/chakra-ui/chakra-ui/tree/main/packages/theme/src/components

import { isNonEmptyArray } from "@apollo/client/utilities";
import { chakraToBreakpointArray } from "./helpers";

export const components = {
  Accordion: {
    baseStyle: {
      container: {
        border: "none",
        pt: 1,
        _first: {
          pt: 0,
        },
      },
      button: {
        transitionProperty: "common",
        transitionDuration: "normal",
        fontSize: "1rem",
        borderBottom: "1px solid",
        borderColor: "cm.accentDark",

        _focus: {
          boxShadow: "none",
        },
        _hover: {
          bg: "none",
          borderColor: "cm.accentLight",
        },
        _disabled: {
          opacity: 0.4,
          cursor: "not-allowed",
        },
        pr: 2,
        pl: 0,
        pt: 2,
      },
      panel: {
        pt: 0,
        px: 0,
        pb: 0,
      },
      icon: {
        fontSize: "1.25em",
      },
    },
  },
  Button: {
    baseStyle: {
      borderRadius: "0",
      _focus: {
        boxShadow: "blue",
      },
      textDecoration: "none !important",
      _hover: {
        color: "white",
      },
      _disabled: {
        _hover: {
          color: "white",
        },
      },
    },
    variants: {
      ghost: {
        bg: "white",
        border: "1px solid",
        borderColor: "cm.accentLight",
        borderRadius: "20px",
        color: "cm.accentLight",
        transition: "all 0.3s",
        _hover: {
          shadow: "0 0px 3px 1px #E42B20",
          bg: "white",
          color: "cm.accentLight",
        },
        _focus: {
          shadow: "0 0px 3px 1px #E42B20",
          bg: "white",
        },
        _active: {
          shadow: "0 0px 3px 1px #E42B20",
          bg: "cm.accentLight",
          color: "#fff",
          ".svg": {
            filter: "invert(100%)",
          },
        },
      },
      outline: {
        bg: "white",
        border: "1px solid",
        borderColor: "cm.accentLight",
        color: "cm.accentLight",
        fontWeight: "bold",
        _hover: {
          shadow: "0 0px 3px 1px #E42B20",
          bg: "white",
          color: "cm.accentLight",
        },
        _focus: {
          shadow: "0 0px 3px 1px #E42B20",
          bg: "white",
          color: "cm.accentLight",
        },
        _active: {
          shadow: "0 0px 3px 1px #E42B20",
          color: "white",
          bg: "cm.accentLight",

          ".svg": {
            filter: "invert(100%)",
          },
        },
      },
      solid: {
        bg: "white",
        border: "none",

        _hover: {
          bg: "white",
          ".svg": {
            filter:
              "filter: invert(13%) sepia(17%) saturate(7488%) hue-rotate(306deg) brightness(99%) contrast(106%);",
          },
        },
        _focus: {
          bg: "white",
          shadow: "0 0px 3px 1px #E42B20",
        },
        _active: {
          ".svg": {
            filter:
              "filter: invert(13%) sepia(17%) saturate(7488%) hue-rotate(306deg) brightness(99%) contrast(106%);",
          },
        },
      },
    },
  },
  Checkbox: {
    baseStyle: {
      icon: {
        diplay: "none",
      },
      control: {
        borderColor: "cm.accentLight",
        borderRadius: "10px",
        _disabled: {
          bg: "gray.100",
          borderColor: "gray.300",
        },
        _checked: {
          bg: "#fff",

          position: "relative",
          "&::after": {
            position: "absolute",
            borderRadius: "10px",
            top: "1px",
            left: "1px",
            width: "10px",
            height: "10px",
            content: '""',
            bg: "cm.accentLight",
          },
        },
      },
    },
  },
  Divider: {
    baseStyle: {
      borderColor: "gray.300",
      maxW: "80%",
      my: 6,
      mx: "auto",
    },
  },
  Heading: {
    sizes: {
      "2xl": {
        lineHeight: chakraToBreakpointArray({
          base: "25px",
          md: "31px",
          xl: "31px",
        }),
        fontSize: chakraToBreakpointArray({
          base: "22px",
          md: "28px",
          xl: "28px",
        }),
      },
    },
  },
  Input: {
    variants: {
      outline: {
        field: {
          bg: "#fff",
          borderRadius: "4px",
          borderColor: "cm.accentLight",
          _hover: {
            borderColor: "cm.accentLight",
          },
          _focus: {
            borderColor: "#fff",
            boxShadow: "0 0 3px 3px #E42B20",
          },
          _autofill: {
            bg: "wine.300",
          },
          _invalid: {
            _focus: {
              borderColor: "#fff",
              boxShadow: "0 0 3px 3px #E42B20",
            },
            _hover: {
              borderColor: "#fff",
              boxShadow: "0px 0 3px 3px #E42B20",
            },
          },
        },
      },
    },
  },
  Select: {
    variants: {
      outline: {
        field: {
          bg: "#fff",
          borderColor: "gray.400",
          _hover: {
            borderColor: "gray.500",
          },
          _autofill: {
            bg: "wine.300",
          },
        },
      },
    },
  },
  Textarea: {
    variants: {
      outline: {
        bg: "#fff",
        borderRadius: "4px",
        borderColor: "cm.accentLight",
        _hover: {
          borderColor: "cm.accentLight",
        },
        _focus: {
          borderColor: "#fff",
          boxShadow: "0 0 3px 3px #E42B20",
        },
        _autofill: {
          bg: "wine.300",
        },
        _invalid: {
          _focus: {
            borderColor: "#fff",
            boxShadow: "0 0 3px 3px #E42B20",
          },
          _hover: {
            borderColor: "#fff",
            boxShadow: "0px 0 3px 3px #E42B20",
          },
        },
      },
    },
  },
  Link: {
    baseStyle: {
      color: "wine.600",
      _hover: {
        color: "wine.800",
      },
    },
  },
  Radio: {
    baseStyle: {
      icon: {
        diplay: "none",
      },
      control: {
        borderColor: "cm.accentLight",
        borderRadius: "10px",
        _disabled: {
          bg: "gray.100",
          borderColor: "gray.300",
        },
        _checked: {
          bg: "#fff",

          position: "relative",
          "&::after": {
            position: "absolute",
            borderRadius: "10px",
            top: "1px",
            left: "1px",
            width: "10px",
            height: "10px",
            content: '""',
            bg: "cm.accentLight",
          },
        },
      },
    },
  },
  Switch: {
    baseStyle: {
      track: {
        bg: "gray.400",
        _invalid: {
          bg: "cm.accentLights",
        },
        _checked: {
          bg: "cm.accentDark",
        },
        _focus: {
          boxShadow: "0 0 3px 3px #E42B20",
        }
      },
    },
  },
};
