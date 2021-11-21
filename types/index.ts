export interface AppProps {
  children?: React.ReactNode;
}

export interface AppConfig {
  colorLight: string;
  colorDark: string;
  lat: number;
  lng: number;
  minZoom: number;
  maxZoom: number;
  bounds: [[number, number], [number, number]],
  zoom: number;
  contactEmail: string;
  apiUrl: string;
  baseUrl: string;
  apiGraphQLUrl: string;
  mapStyleJsonUrl: string;
  defaultLanguage: string;
  activeLanguages: string[];
  nav: Record<string, any[]>;
  umamiId: string;
  umamiUrl: string;
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