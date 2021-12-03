import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import type { NextRouter } from "next/router";
import type { AppConfig } from "~/types";
import type { AppTranslationHelper } from "~/hooks/useAppTranslations";

import { MapPopup } from "./MapPopup";
import { MapViewClustered } from "./MapViewClustered";
import { MapViewUnclustered } from "./MapViewUnclustered";
import { MapClusterDetail } from "./MapClusterDetail";
import { MapUserLocation } from "./MapUserLocation";
import { MapHighlights, MapHighlightType } from "./MapHighlights";
import { MapTour, MapTourType } from "./MapTour";

export class CultureMap {
  POPUP_OFFSET_MOUSE = [0, -25] as [number, number];
  POPUP_OFFSET_TOUCH = [53, 27] as [number, number];

  MAX_BOUNDS_ZOOM = 14;
  ZOOM_LEVEL_HIDE_ADJUSTOR = 0.5;

  isAnimating = false;
  clickBlock = false;

  highlights: MapHighlights;
  userLocation: MapUserLocation;

  router: NextRouter;
  map: maplibregl.Map | null;
  mapContainerRef: HTMLDivElement | null;
  tHelper: AppTranslationHelper;
  config: AppConfig;
  popup: MapPopup;
  clusterDetail: MapClusterDetail;
  tour: MapTour;

  locationId: number | null;
  overlayZoomLevel: number;
  geoJsonAllData: any = null;

  intitiallyFitToBounds: boolean = true;
  isEmbed = false;
  isInit = false;
  loaded = false;
  styleLoaded = false;
  baseDataLoaded = false;
  ready = false;
  onLoadJobs: any[] = [];
  currentView = "clustered";
  views: Record<string, any> = {};

  constructor(
    router: NextRouter,
    tHelper: AppTranslationHelper,
    config: AppConfig
  ) {
    console.log("new culturemap");
    this.map = null;
    this.mapContainerRef = null;
    this.locationId = null;

    this.config = config;
    this.tHelper = tHelper;

    this.router = router;
    this.overlayZoomLevel = 0;

    this.popup = new MapPopup(this);
    this.clusterDetail = new MapClusterDetail(this);
    this.highlights = new MapHighlights(this);
    this.userLocation = new MapUserLocation(this);
    this.tour = new MapTour(this);

    this.views["clustered"] = new MapViewClustered(this);
    this.views["unclustered"] = new MapViewUnclustered(this);
  }

  init(ref: HTMLDivElement, setIsLoaded: Function, isEmbed: boolean) {
    console.log("loading init", ref);
    if (this.isInit) return;
    console.log("loading init 2");

    this.isInit = true;
    this.mapContainerRef = null;
    this.isEmbed = isEmbed;

    this.ready = false;
    this.styleLoaded = false;
    this.loaded = false;
    this.onLoadJobs = [];

    this.map = new maplibregl.Map({
      container: ref,
      style: this.config.mapStyleJsonUrl,
      center: [this.config.lng, this.config.lat],
      zoom: this.config.zoom,
      maxBounds: this.config.bounds,
      minZoom: this.config.minZoom,
      maxZoom: this.config.maxZoom,
      attributionControl: false,
    });
    this.map.addControl(
      new maplibregl.AttributionControl({
        customAttribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="nofollow noreferrer">OpenStreetMap contributors</a>',
      }),
      "bottom-right"
    );
    this.clusterDetail.init();

    this.onLoadJobs.push(async (resolve?: any) => {
      if (this.currentView in this.views) {
        console.log("process 1");
        this.views[this.currentView].setData();
        setTimeout(() => {
          console.log("process 2");
          this.views[this.currentView].render();
          this.views[this.currentView].fitToBounds();
          if (typeof resolve !== "undefined") resolve(true);
        }, 100);
      }
    });

    const process = async () => {
      if (this.ready) return;
      this.ready = true;

      if (typeof setIsLoaded === "function") setIsLoaded.call(null, true);

      console.log(this.onLoadJobs);
      this.onLoadJobs.forEach(async (f) => {
        await new Promise(f);
      });
      console.log("processed all unload jobs");
    };

    const maybeProcess = async () => {
      console.log("maybe process");
      if (this.baseDataLoaded && this.styleLoaded && this.loaded)
        await process();
    };

    this.map.once("style.load", () => {
      this.styleLoaded = true;
      console.log("mb process 1");
      maybeProcess();
    });
    this.map.once("load", () => {
      this.loaded = true;

      this?.map?.on("movestart", (e) => {
        this.isAnimating = e?.cmAnimation === true;
      });

      this?.map?.on("moveend", (e) => {
        if (!this.map) return;
        this.isAnimating = false;
        if (this.map.getZoom() > this.config.maxZoom - 1) {
          this.map.zoomTo(
            this.config.maxZoom - 1.1,
            {},
            {
              cmAnimation: true,
            }
          );
        }
      });
      console.log("mb process 2");
      maybeProcess();
    });

    if (typeof window !== "undefined") {
      fetch(`${this.config.apiUrl}/geojson`).then(async (response) => {
        if (response.ok) {
          const data = await response.json();
          if (
            data &&
            data?.type &&
            data?.type === "FeatureCollection" &&
            Array.isArray(data?.features)
          ) {
            this.geoJsonAllData = data;
            this.baseDataLoaded = true;

            console.log("mb process 3");
            maybeProcess();
          }
        }
      });
    }
  }

  clearOnloadJobs = () => (this.onLoadJobs = []);

  setInitallyFitToBounds = (flag: boolean) =>
    (this.intitiallyFitToBounds = flag);

  setView(view: string) {
    if (this.map) {
      const run = async (resolve?: any) => {
        console.log("setView", view);
        Object.keys(this.views).forEach((v: string) => {
          if (v !== view) {
            this.views[v].clear();
          }
        });
        this.popup.hide();
        this.clusterDetail.hide();
        this.views[view].setData();

        setTimeout(() => {
          this.views[view].render();
          this.views[view].show();
          if (typeof resolve !== "undefined") resolve(true);
        }, 100);

        this.currentView = view;
      };

      if (view === this.currentView) return;

      if (!this.ready) {
        this.currentView = view;
        this.onLoadJobs.push(run);
      } else {
        run();
      }
    }
  }

  hideCurrentView() {
    if (this.map) {
      const run = async (resolve?: any) => {
        console.log("hideCurrentVIew", this.currentView);
        this.popup.hide();
        this.clusterDetail.hide();
        this.views[this.currentView].hide();
        if (typeof resolve !== "undefined") resolve(true);
      };
      if (!this.ready) {
        this.onLoadJobs.push(run);
      } else {
        run();
      }
    }
  }

  showCurrentView() {
    if (this.map) {
      const run = async (resolve?: any) => {
        console.log("showCurrentView", this.currentView);
        this.popup.hide();
        this.clusterDetail.hide();
        this.views[this.currentView].show();
        if (typeof resolve !== "undefined") resolve(true);
      };
      if (!this.ready) {
        this.onLoadJobs.push(run);
      } else {
        run();
      }
    }
  }

  renderCurrentView() {
    if (this.map) {
      const run = async (resolve?: any) => {
        console.log("renderCurrentView", this.currentView);
        this.popup.hide();
        this.clusterDetail.hide();
        this.views[this.currentView].render();
        if (typeof resolve !== "undefined") resolve(true);
      };
      if (!this.ready) {
        this.onLoadJobs.push(run);
      } else {
        run();
      }
    }
  }

  setCurrentViewData(data?: any, show?: boolean) {
    if (this.map) {
      const run = async (resolve?: any) => {
        console.log("setCurrentViewData", this.currentView);
        this.popup.hide();
        this.clusterDetail.hide();
        this.views[this.currentView].setData(data);

        if (show) {
          setTimeout(() => {
            this.views[this.currentView].show();
            if (typeof resolve !== "undefined") resolve(true);
          }, 100);
        }
      };

      if (!this.ready) {
        this.onLoadJobs.push(run);
      } else {
        run();
      }
    }
  }

  setFilteredViewData(ids: any[]) {
    if (this.map) {
      const run = async (resolve?: any) => {
        console.log("setFilteredViewData", this.currentView);
        this.popup.hide();
        this.clusterDetail.hide();

        if (this.geoJsonAllData && this.geoJsonAllData?.features?.length) {
          console.log(4444);
          this.views[this.currentView].setData({
            type: "FeatureCollection",
            features: this.geoJsonAllData?.features.filter((f: any) =>
              ids.includes(f?.properties?.id)
            ),
          });
          if (typeof resolve !== "undefined") resolve(true);
        } else {
          console.log(5555);
          this.views[this.currentView].setData({
            type: "FeatureCollection",
            features: [],
          });
          setTimeout(() => {
            console.log(6666);
            this.views[this.currentView].show();
            if (typeof resolve !== "undefined") resolve(true);
          }, 100);
        }
      };

      if (!this.ready) {
        this.onLoadJobs.push(run);
      } else {
        run();
      }
    }
  }

  fitToCurrentViewBounds() {
    if (this.map) {
      const run = async (resolve?: any) => {
        console.log("fitToCurrentViewBounds", this.currentView);
        this.popup.hide();
        this.clusterDetail.hide();
        this.views[this.currentView].fitToBounds();
        if (typeof resolve !== "undefined") resolve(true);
      };

      if (!this.ready) {
        this.onLoadJobs.push(run);
      } else {
        run();
      }
    }
  }

  onMapPointNavigate(slug: any) {
    if (!slug) return null;

    this.popup.hide();

    if (this.isEmbed && typeof window !== "undefined") {
      window.open(`${this.config.baseUrl}${slug}`, "_ blank");
    } else {
      this.router.push(slug);
    }
  }

  setTourStops(stops: MapTourType[]) {
    if (this.map) {
      const run = async (resolve?: any) => {
        console.log("setTourStops", this.currentView);
        const stopsGeoJSON = {
          features: [
            ...stops.reduce((features: any, tourStop: any, index: number) => {
              features.push({
                type: "Feature",
                geometry: {
                  coordinates: [tourStop.lng ?? 0.0, tourStop.lat ?? 0.0],
                  type: "Point",
                },
                properties: {
                  id: `loc-${tourStop.id}`,
                  color: tourStop.color,
                  highlight: !!tourStop.highlight,
                  title: tourStop.title,
                  slug: tourStop.slug,
                  strokeColor: "transparent",
                  radius: 16,
                  strokeWidth: 0,
                },
              });
              features.push({
                type: "Feature",
                geometry: {
                  coordinates: [tourStop.lng ?? 0.0, tourStop.lat ?? 0.0],
                  type: "Point",
                },
                properties: {
                  id: `loc-number-${tourStop.id}`,
                  number: tourStop?.number,
                  highlightNumber: !!tourStop.highlight,
                },
              });
              return features;
            }, []),
          ],
          type: "FeatureCollection",
        };

        this.tour.setTourStopsData(stopsGeoJSON);
        this.tour.renderStops();
        if (typeof resolve !== "undefined") resolve(true);
      };
      if (!this.ready) {
        this.onLoadJobs.push(run);
      } else {
        run();
      }
    }
  }

  setTourPath(path: any) {
    if (this.map) {
      const run = async (resolve?: any) => {
        console.log("setTourPath", this.currentView);
        this.tour.setTourPathData(path);
        this.tour.renderPath();
        if (typeof resolve !== "undefined") resolve(true);
      };
      if (!this.ready) {
        this.onLoadJobs.push(run);
      } else {
        run();
      }
    }
  }

  fitToCurrentTourBounds() {
    if (this.map) {
      const run = async (resolve?: any) => {
        console.log("fitToCurrentTourBounds", this.currentView);
        this.popup.hide();
        this.clusterDetail.hide();
        this.tour.fitToBounds();
        if (typeof resolve !== "undefined") resolve(true);
      };

      if (!this.ready) {
        this.onLoadJobs.push(run);
      } else {
        run();
      }
    }
  }

  clearTour() {
    if (this.map) {
      const run = async (resolve?: any) => {
        console.log("clearTour", this.currentView);
        this.tour.clear();
        if (typeof resolve !== "undefined") resolve(true);
      };
      if (!this.ready) {
        this.onLoadJobs.push(run);
      } else {
        run();
      }
    }
  }

  setHighlights(highlights: MapHighlightType[]) {
    if (this.map) {
      const run = async (resolve?: any) => {
        console.log("setHighlights", this.currentView);
        const data = {
          features: highlights.reduce((features: any, highlight: any) => {
            features.push({
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
            });
            features.push({
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
            });
            return features;
          }, []),
          type: "FeatureCollection",
        };

        this.highlights.setData(data);
        this.highlights.render();
        if (typeof resolve !== "undefined") resolve(true);
      };
      if (!this.ready) {
        this.onLoadJobs.push(run);
      } else {
        run();
      }
    }
  }

  clearHighlights() {
    if (this.map) {
      const run = async (resolve?: any) => {
        console.log("clearHighlights", this.currentView);
        this.highlights.clear();
        if (typeof resolve !== "undefined") resolve(true);
      };
      if (!this.ready) {
        this.onLoadJobs.push(run);
      } else {
        run();
      }
    }
  }

  setUserLocation(lng: number, lat: number) {
    if (this.map) {
      const run = async (resolve?: any) => {
        console.log("setUserLocation", this.currentView);
        this.userLocation.setData(lng, lat);
        this.userLocation.render();
        if (typeof resolve !== "undefined") resolve(true);
      };
      if (!this.ready) {
        this.onLoadJobs.push(run);
      } else {
        run();
      }
    }
  }

  clearUserLocation() {
    if (this.map) {
      const run = async (resolve?: any) => {
        console.log("clearUserLocation", this.currentView);
        this.userLocation.clear();
        if (typeof resolve !== "undefined") resolve(true);
      };
      if (!this.ready) {
        this.onLoadJobs.push(run);
      } else {
        run();
      }
    }
  }

  getCenterOffset(
    withDrawer?: boolean,
    withVerticalScroller?: boolean
  ): [number, number] {
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
      return withDrawer
        ? [window.innerWidth * 0.4, 30]
        : withVerticalScroller
        ? [0, -(window.innerHeight * 0.25)]
        : [0, 30];
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

  getBoundsPadding() {
    if (typeof window === "undefined")
      return {
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
      };

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
      return {
        top: 80,
        right: 40,
        bottom: 100,
        left: 80,
      };
    } else if (isTablet && !isTabletWide) {
      return {
        top: 80,
        right: 40,
        bottom: 40,
        left: 120,
      };
    } else if (isTabletWide) {
      return {
        top: 80,
        right: 40,
        bottom: 40,
        left: 160,
      };
    } else if (isDesktop) {
      return {
        top: 80,
        right: 40,
        bottom: 100,
        left: 400,
      };
    } else {
      return {
        top: 80,
        right: 40,
        bottom: 100,
        left: 695 + (window.innerWidth * 0.08 - 55) + 40,
      };
    }
  }

  panTo(
    lng: number,
    lat: number,
    withDrawer?: boolean,
    withVerticalScroller?: boolean
  ) {
    if (this.map) {
      const run = async (resolve?: any) => {
        console.log("panTo", this.currentView);
        if (isNaN(lng) || isNaN(lat)) return;
        this.map?.stop();
        this.map?.panTo(
          [lng, lat],
          {
            animate: true,
            duration: 1000,
            essential: true,
            offset: this.getCenterOffset(withDrawer, withVerticalScroller),
          },
          {
            cmAnimation: true,
          }
        );
        if (typeof resolve !== "undefined") resolve(true);
      };

      if (!this.ready) {
        this.onLoadJobs.push(run);
      } else {
        run();
      }
    }
  }

  moveTo(
    lng: number,
    lat: number,
    withDrawer?: boolean,
    withVerticalScroller?: boolean
  ) {
    if (this.map) {
      const run = async (resolve?: any) => {
        console.log("moveTo", this.currentView);
        if (isNaN(lng) || isNaN(lat)) return;
        this.map?.stop();
        this.map?.panTo(
          [lng, lat],
          {
            animate: false,
            duration: 0,
            essential: false,
            offset: this.getCenterOffset(withDrawer, withVerticalScroller),
          },
          {
            cmAnimation: true,
          }
        );
        if (typeof resolve !== "undefined") resolve(true);
      };

      if (!this.ready) {
        this.onLoadJobs.push(run);
      } else {
        run();
      }
    }
  }

  toggleLayersVisibility = (layers: string[], visibility: string) => {
    if (!this.map) return;

    layers.forEach((l) => {
      if (this?.map?.getLayer(l)) {
        this?.map?.setLayoutProperty(l, "visibility", visibility);
      }
    });
  };

  removeLayers = (layers: string[]) => {
    if (!this.map) return;

    layers.forEach((l) => {
      if (this?.map?.getLayer(l)) {
        this.map?.removeLayer(l);
      }
    });
  };
}
