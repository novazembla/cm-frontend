// Defaults are defined here:
// https://github.com/chakra-ui/chakra-ui/tree/main/packages/theme/src/components

import { chakraToBreakpointArray } from "./helpers";


export const components = {
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
      outline: {
        bg: "white",
      },
    },
  },
  Checkbox: {
    baseStyle: {
      control: {
        borderColor: "gray.500",

        _disabled: {
          bg: "gray.100",
          borderColor: "gray.300",
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
      "2xl":  {
        lineHeight: chakraToBreakpointArray({
          base: "25px",
          md: "31px",
          xl:  "31px",
        }),
        fontSize: chakraToBreakpointArray({
          base: "22px",
          md: "28px",
          xl:  "28px",
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
  Link: {
    baseStyle: {
      color: "wine.600",
      _hover: {
        color: "wine.800",
      },
    },
  },
  Switch: {
    baseStyle: {
      track: {
        bg: "gray.400",
        _invalid: {
          bg: "red.400",
        },
      },
    },
  },
  
};
