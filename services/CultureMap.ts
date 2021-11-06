import maplibregl from "maplibre-gl";
import { I18n } from "next-i18next";
import { NextRouter } from "next/router";

import type { AppConfig, MapPin } from "~/types";
import type { AppTranslationHelper } from "~/hooks";

import { MapPopup } from "./MapPopup";
import axios, { AxiosResponse } from "axios";
import { MapViewClustered } from "./MapViewClustered";
import { MapViewUnclustered } from "./MapViewUnclustered";
import { MapClusterDetail } from "./MapClusterDetail";
import { MapHighlight, MapHighlightType } from "./MapHighlight";


export class CultureMap {
  POPUP_OFFSET_MOUSE = [0, -25] as [number, number];
  POPUP_OFFSET_TOUCH = [53, 27] as [number, number];

  MAP_MIN_ZOOM = 9;
  MAP_MAX_ZOOM = 19;
  ZOOM_LEVEL_HIDE_ADJUSTOR = 0.5;

  isAnimating = false;
  clickBlock = false;

  highlight: MapHighlight;

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
  activeView = "clustered";

  views: Record<string, any> = {};

  constructor(
    router: NextRouter,
    tHelper: AppTranslationHelper,
    config: AppConfig
  ) {
    this.map = null;
    this.mapContainerRef = null;
    this.locationId = null;

    this.config = config;
    this.tHelper = tHelper;

    this.router = router;
    this.overlayZoomLevel = 0;

    this.popup = new MapPopup(this);
    this.clusterDetail = new MapClusterDetail(this);
    this.highlight = new MapHighlight(this);

    this.views["clustered"] = new MapViewClustered(this);
    this.views["unclustered"] = new MapViewUnclustered(this);
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

      if (this.activeView in this.views) {
        this.views[this.activeView].setData();
        this.views[this.activeView].render();
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

  setView(view: string) {
    console.log("CultureMap Set view", view);
    if (this.map) {
      const run = () => {
        console.log("CultureMap Set run", view);
        console.log("CultureMap Set change", view);
        Object.keys(this.views).forEach((v: string) => {
          if (v !== view) {
            this.views[v].clear();
          }
        });
        this.popup.hide();
        this.clusterDetail.hide();
        this.views[view].setData();
        this.views[view].render();
        this.activeView = view;
      };

      if (view === this.activeView) return;

      if (!this.ready) {
        this.activeView = view;
        this.onLoadJobs.push(run);
      } else {
        run();
      }
    }
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

  setHighlight(highlight: MapHighlightType) {

    if (this.map) {
      const run = () => {
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
                title: highlight.title,
                slug: highlight.slug,
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

        this.highlight.setData(data);
        this.highlight.render();

      };
      if (!this.ready) {
        this.onLoadJobs.push(run);
      } else {
        run();
      }
    }
  }

  clearHighlight() {
    if (this.map) {
      const run = () => {
        this.highlight.clear();
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
