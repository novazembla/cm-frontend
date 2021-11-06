export interface AppProps {
  children?: React.ReactNode;
}

export interface AppConfig {
  colorLight: string;
  colorDark: string;
  lat: number;
  lng: number;
  zoom: number;
  contactEmail: string;
  apiURL: string;
  apiGraphQLURL: string;
  mapStyleJsonUrl: string;
  defaultLanguage: string;
  activeLanguages: string[];
  nav: Record<string, any[]>;
}

export interface MapPin {
  id: number;
  type: string;
  slug: Record<string, string>;
  lat: number;
  lng: number;
}

export interface QuickSearchResult {
  items: QuickSearchResultItem[];
  totalCount: number;
}

export interface QuickSearchResultItem {
  id: number;
  type: string;
  lat: number;
  lng: number;
  title: Record<string, string>;
  excerpt: Record<string, string>;
  slug: Record<string, string>;
  geopoint: Record<string, number>;
}