import maplibregl from "maplibre-gl";
import { I18n } from "next-i18next";
import { NextRouter } from "next/router";

import type { AppConfig, MapPin } from "~/types";
import type { AppTranslationHelper } from "~/hooks";

import { MapPopup } from "./MapPopup";
import axios, { AxiosResponse } from "axios";
import { MapViewClustered } from "./MapViewClustered";
import { MapClusterDetail } from "./MapClusterDetail";

type MapHighlight = {
  id: number;
  lng: number;
  lat: number;
  color: string;
};

export class CultureMap {
  POPUP_OFFSET_MOUSE = [0, -25] as [number, number];
  POPUP_OFFSET_TOUCH = [53, 27] as [number, number];

  MAP_MIN_ZOOM = 9;
  MAP_MAX_ZOOM = 19;
  ZOOM_LEVEL_HIDE_ADJUSTOR = 0.5;

  isAnimating = false;
  clickBlock = false;

  highlight: MapHighlight | null;

  router: NextRouter;
  map: maplibregl.Map | null;
  mapContainerRef: HTMLDivElement | null;
  tHelper: AppTranslationHelper;
  config: AppConfig;
  popup: MapPopup;
  clusterDetail: MapClusterDetail;

  locationId: number | null;
  overlayZoomLevel: number;
  geoJsonAllData: any = null;

  loaded = false;
  baseDataLoaded = false;
  ready = false;
  onLoadJobs: any[] = [];
  initialView = "clustered";
  activeView = "clustered";

  views: Record<string, any> = {};

  constructor(
    router: NextRouter,
    tHelper: AppTranslationHelper,
    config: AppConfig
  ) {
    this.highlight = null;
    this.map = null;
    this.mapContainerRef = null;
    this.locationId = null;

    this.config = config;
    this.tHelper = tHelper;

    this.router = router;
    this.overlayZoomLevel = 0;

    this.popup = new MapPopup(this);
    this.clusterDetail = new MapClusterDetail(this);

    this.views["clustered"] = new MapViewClustered(this);
  }

  init(ref: HTMLDivElement) {
    this.mapContainerRef = null;

    this.map = new maplibregl.Map({
      container: ref,
      style: this.config.mapStyleJsonUrl,
      center: [this.config.lng, this.config.lat],
      zoom: this.config.zoom,
      minZoom: this.MAP_MIN_ZOOM,
      maxZoom: this.MAP_MAX_ZOOM,
    });

    this.clusterDetail.init();

    const process = () => {
      this.ready = true;
      
      if (this.initialView in this.views) {
        this.views[this.initialView].setData();
        this.views[this.initialView].init();
        this.activeView = this.initialView;
      }
      
      this.onLoadJobs.map((f) => {
        if (typeof f === "function") f.call();
      });
    };

    this.map.once("load", () => {
      this.loaded = true;

      if (!this.map) return;

      this.map.on("movestart", (e) => {
        this.isAnimating = e?.cmAnimation === true;
      });

      this.map.on("moveend", (e) => {
        if (!this.map) return;
        this.isAnimating = false;
        if (this.map.getZoom() > this.MAP_MAX_ZOOM - 1) {
          this.map.zoomTo(
            this.MAP_MAX_ZOOM - 1.1,
            {},
            {
              cmAnimation: true,
            }
          );
        }
      });

      if (this.baseDataLoaded) process();
    });

    const client = axios.create({
      baseURL: this.config.apiURL,
    });

    client
      .get(`/geojson`)
      .then((response: AxiosResponse<any>) => {
        if (
          response.data &&
          response?.data?.type &&
          response?.data?.type === "FeatureCollection" &&
          Array.isArray(response?.data?.features)
        ) {
          this.geoJsonAllData = response?.data;
          console.log("trigger data", this.geoJsonAllData);
          this.baseDataLoaded = true;

          if (this.loaded) process();
        }
      })
      .catch((err) => {
        throw err;
      });
  }

  setInitialView(view: string) {
    this.initialView = view;
  }

  onMapPointNavigate(slug: any) {
    if (!slug) return null;

    this.popup.hide();
    
    if (this.tHelper.i18n?.language === "en") {
      this.router.push(`/location/${slug}`);
    } else {
      this.router.push(`/kartenpunkt/${slug}`);
    }
  }

  setHighlight(highlight: MapHighlight) {
    this.highlight = highlight;

    if (this.map) {
      const run = () => {

        console.log("setting new highlight")
        const data = {
          features: [
            {
              type: "Feature",
              geometry: {
                coordinates: [highlight.lng ?? 0.0, highlight.lat ?? 0.0],
                type: "Point",
              },
              properties: {
                id: `loc-${highlight.id}`,
                color: "#fff",
                strokeColor: highlight.color,
                radius: 20,
                strokeWidth: 2,
              },
            },
            {
              type: "Feature",
              geometry: {
                coordinates: [highlight.lng ?? 0.0, highlight.lat ?? 0.0],
                type: "Point",
              },
              properties: {
                id: `loc-${highlight.id}`,
                color: highlight.color,
                strokeColor: "transparent",
                radius: 16,
                strokeWidth: 0,
              },
            },
          ],
          type: "FeatureCollection",
        };
        if (this.map?.getLayer("highlight")) this.map?.removeLayer("highlight");
        if (!this.map?.getSource("highlight")) {
          this.map?.addSource("highlight", {
            type: "geojson",
            data,
          });
        } else {
          (
            this.map?.getSource("highlight") as maplibregl.GeoJSONSource
          )?.setData(data);
        }
        this.map?.addLayer({
          id: "highlight",
          type: "circle",
          source: "highlight",
          paint: {
            "circle-color": ["get", "color"],
            "circle-radius": ["get", "radius"],
            "circle-stroke-color": ["get", "strokeColor"],
            "circle-stroke-width": ["get", "strokeWidth"],
            // [
            //   "interpolate",
            //   ["linear"],
            //   ["zoom"],
            //   // zoom is 8 (or less) -> circle radius will be 2px
            //   8,
            //   2,
            //   // zoom is 18 (or greater) -> circle radius will be 20px
            //   16,
            //   16,
            // ],
          },
        });
      };
      if (!this.ready) {
        this.onLoadJobs.push(run);
      } else {
        run();
      }
    }
  }

  clearHighlight() {
    this.highlight = null;

    if (this.map) {
      const run = () => {
        console.log("removing highlight")
        if (this.map?.getLayer("highlight")) this.map?.removeLayer("highlight");
      };
      if (!this.ready) {
        this.onLoadJobs.push(run);
      } else {
        run();
      }
    }
  }

  getCenterOffset(withDrawer?: boolean): [number, number] {
    if (typeof window === "undefined") return [0, 0];

    const isMobile = window.matchMedia("(max-width: 44.9999em)").matches;
    const isTablet = window.matchMedia(
      "(min-width: 45em) and (max-width: 74.9999em)"
    ).matches;
    const isTabletWide = window.matchMedia(
      "(min-width: 62em) and (max-width: 74.9999em)"
    ).matches;
    const isDesktop = window.matchMedia(
      "(min-width: 75em) and (max-width: 119.9999em)"
    ).matches;

    if (isMobile) {
      return withDrawer ? [window.innerWidth * 0.4, 30] : [0, 30];
    } else if (isTablet && !isTabletWide) {
      return withDrawer ? [window.innerWidth * 0.4, 30] : [0, 30];
    } else if (isTabletWide) {
      return [window.innerWidth * 0.3333, 30];
    } else if (isDesktop) {
      return [725 / 2, 40];
    } else {
      return [(695 + (window.innerWidth * 0.08 - 55)) / 2, 40];
    }
  }

  panTo(lng: number, lat: number, withDrawer?: boolean) {
    if (this.map) {
      const run = () => {
        this.map?.panTo(
          [lng, lat],
          {
            animate: true,
            duration: 1000,
            essential: true,
            offset: this.getCenterOffset(withDrawer),
          },
          {
            cmAnimation: true,
          }
        );
      };

      if (!this.ready) {
        this.onLoadJobs.push(run);
      } else {
        run();
      }
    }
  }
}
