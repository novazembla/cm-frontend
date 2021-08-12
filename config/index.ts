import type { AppConfig } from "~/types";

export const appConfig: AppConfig = {
  contactEmail: "info@culturemap.test",
  apiGraphQLURL: `${process.env.NEXT_PUBLIC_API_GRAPHQL_URL}`,
  mapApiKey: `${process.env.NEXT_PUBLIC_MAP_API_KEY}`,
  defaultLanguage: "en",
  activeLanguages: ["en", "de"],
  lat: 52.525590,
  lng: 13.493659,
  zoom: 14,
};