import { setLocale } from "yup";

import type { AppConfig } from "~/types";
import translations from "./translations";

setLocale(translations);

// Please not you can leave values empty to hide a link for a certain language
export const appConfigMainNav = [
  {
    path: {
      de: "/karte",
      en: "/map",
    },
    title: {
      de: "Karte",
      en: "Map",
    },
  },
  {
    path: {
      de: "/veranstaltungen",
    },
    title: {
      de: "Veranstaltungen",
    },
  },
  {
    path: {
      de: "/touren",
      en: "/tours",
    },
    title: {
      de: "Touren",
      en: "Tours",
    },
  },
  {
    path: {
      de: "/seite/inhalte-vorschlagen",
      en: "/suggest-a-location",
    },
    title: {
      de: "Inhalte vorschlagen",
      en: "Suggest a location",
    },
  },
  {
    path: {
      de: "/seite/ueber-die-kulturkarte",
      en: "/page/about-the-culture-map",
    },
    title: {
      de: "Über die Karte",
      en: "About the Map",
    },
  },
];

export const appConfigFooterNav = [
  
  {
    path: {
      de: "/seite/nutzungshinweise",
      en: "/page/usage-guidance",
    },
    title: {
      de: "Nutzungshinweise",
      en: "How to use the map",
    },
  },
  {
    path: {
      de: "/seite/barrierefreiheit",
      en: "/page/accessibility-information",
    },
    title: {
      de: "Barrierefreiheit",
      en: "Accessibility Information",
    },
  },
  {
    path: {
      de: "/seite/orte-einbinden",
      en: "/page/embed-locations",
    },
    title: {
      de: "Embedcodes generieren",
      en: "Generate embed codes",
    },
  },
  {
    path: {
      de: "/seite/impressum",
      en: "/page/imprint",
    },
    title: {
      de: "Impressum",
      en: "Imprint",
    },
  },
  {
    path: {
      de: "/seite/datenschutzinformation",
      en: "/page/privacy-information",
    },
    title: {
      de: "Datenschutzinformation",
      en: "GDPR Information",
    },
  },
];

export const appConfig: AppConfig = {
  colorLight: "#E42B20",
  colorDark: "#660D36",
  contactEmail: "info@culturemap.test",
  twitterHandle: "balichtenberg",
  apiUrl: `${process.env.NEXT_PUBLIC_API_URL ?? ""}`,
  baseUrl: `${process.env.NEXT_PUBLIC_URL ?? ""}`,
  apiGraphQLUrl: `${process.env.NEXT_PUBLIC_API_URL}/graphql`,
  mapStyleJsonUrl: `${process.env.NEXT_PUBLIC_MAP_JSON_URL ?? ""}`,
  defaultLanguage: "de",
  activeLanguages: ["en", "de"],
  lat: 52.52559,
  lng: 13.493659,
  bounds: [[12.583801,52.154557],[14.117298,52.869959]],
  minZoom: 10,
  zoom: 13,
  boundingBoxZoom: 13,
  maxZoom: 20,
  clusterRadius: 35,
  nav: {
    main: appConfigMainNav,
    footer: appConfigFooterNav,
  },
  umamiId: `${process.env.NEXT_PUBLIC_UMAMI_TRACKING_ID ?? ""}`,
  umamiUrl: `${process.env.NEXT_PUBLIC_UMAMI_URL ?? ""}`,
  eventLookAheadDays: 100,
};
