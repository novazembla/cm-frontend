import type { AppConfig } from "~/types";
import "./translations";

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
      de: "/seite/ueber-die-kulturkarte",
      en: "/page/about",
    },
    title: {
      de: "Über die Kulturkarte",
      en: "About the Map",
    },
  },
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
      de: "/kartenpunktvorschlag",
      en: "/suggest-a-location",
    },
    title: {
      de: "Kartenpunkt vorschlagen",
      en: "Suggest a location",
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
      de: "/veranstaltungen",
      en: "/events",
    },
    title: {
      de: "Veranstaltungen",
      en: "Events",
    },
  },
];

export const appConfigFooterNav = [
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
  zoom: 14,
  maxZoom: 19,
  nav: {
    main: appConfigMainNav,
    footer: appConfigFooterNav,
  },
  umamiId: `${process.env.NEXT_PUBLIC_UMAMI_TRACKING_ID ?? ""}`,
  umamiUrl: `${process.env.NEXT_PUBLIC_UMAMI_URL ?? ""}`,
};
