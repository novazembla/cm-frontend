import type { AppConfig } from "~/types";

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
      de: "/seite/ueber-uns",
      en: "/page/about-us",
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
  {
    path: {
      de: "/suche",
      en: "/search",
    },
    title: {
      de: "Detailsuche",
      en: "Advanced Search",
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
      de: "/seite/datenschutz",
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
  apiGraphQLURL: `${process.env.NEXT_PUBLIC_API_GRAPHQL_URL}`,
  mapApiKey: `${process.env.NEXT_PUBLIC_MAP_API_KEY}`,
  defaultLanguage: "de",
  activeLanguages: ["en", "de"],
  lat: 52.52559,
  lng: 13.493659,
  zoom: 14,
  nav: {
    main: appConfigMainNav,
    footer: appConfigFooterNav,
  },
};
