import React from "react";

export interface AppProps {
  children?: React.ReactNode;
}

export interface AppConfig {
  lat: number;
  lng: number;
  zoom: number;
  contactEmail: string;
  apiGraphQLURL: string;
  mapApiKey: string;
  defaultLanguage: string;
  activeLanguages: string[];
}
