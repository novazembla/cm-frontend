import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { NextRouter } from "next/router";

import type { AppConfig } from "~/types";
import type { AppTranslationHelper } from "~/hooks";

import { MapPopup } from "./MapPopup";
import axios, { AxiosResponse } from "axios";
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

  init(ref: HTMLDivElement, setIsLoaded: Function) {
    this.mapContainerRef = null;

    this.map = new maplibregl.Map({
      container: ref,
      style: this.config.mapStyleJsonUrl,
      center: [this.config.lng, this.config.lat],
      zoom: this.config.zoom,
      maxBounds: this.config.bounds,
      minZoom: this.config.minZoom,
      maxZoom: this.config.maxZoom,
    });

    console.log({
      container: ref,
      style: this.config.mapStyleJsonUrl,
      center: [this.config.lng, this.config.lat],
      zoom: this.config.zoom,
      bounds: this.config.bounds,
      minZoom: this.config.minZoom,
      maxZoom: this.config.maxZoom,
    })
    this.clusterDetail.init();

    const process = () => {
      this.ready = true;

      if (typeof setIsLoaded === "function") setIsLoaded.call(null, true);

      if (this.currentView in this.views) {
        this.views[this.currentView].setData();
        setTimeout(() => {
          this.views[this.currentView].render();
          this.views[this.currentView].hide();
          this.views[this.currentView].fitToBounds();
        }, 100);
      }

      setTimeout(() => {
        this.onLoadJobs.forEach((f) => {
          if (typeof f === "function") f.call();
        });
      }, 500);
    };

    const maybeProcess = () => {
      if (this.baseDataLoaded && this.styleLoaded && this.loaded) process();
    };

    this.map.once("style.load", () => {
      this.styleLoaded = true;
      maybeProcess();
    });
    this.map.once("load", () => {
      this.loaded = true;

      if (!this.map) return;

      this.map.on("movestart", (e) => {
        this.isAnimating = e?.cmAnimation === true;
      });

      this.map.on("moveend", (e) => {
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

      maybeProcess();
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
          this.baseDataLoaded = true;

          maybeProcess();
        }
      })
      .catch((err) => {
        throw err;
      });
  }

  setView(view: string) {
    if (this.map) {
      const run = () => {
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
      const run = () => {
        this.popup.hide();
        this.clusterDetail.hide();
        this.views[this.currentView].hide();
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
      const run = () => {
        this.popup.hide();
        this.clusterDetail.hide();
        this.views[this.currentView].show();
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
      const run = () => {
        this.popup.hide();
        this.clusterDetail.hide();
        this.views[this.currentView].setData(data);

        if (show) {
          setTimeout(() => {
            this.views[this.currentView].show();
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
      const run = () => {
        this.popup.hide();
        this.clusterDetail.hide();

        if (this.geoJsonAllData && this.geoJsonAllData?.features?.length) {
          this.views[this.currentView].setData({
            type: "FeatureCollection",
            features: this.geoJsonAllData?.features.filter((f: any) =>
              ids.includes(f?.properties?.id)
            ),
          });
        } else {
          this.views[this.currentView].setData({
            type: "FeatureCollection",
            features: [],
          });
          setTimeout(() => {
            this.views[this.currentView].show();
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
      const run = () => {
        this.popup.hide();
        this.clusterDetail.hide();
        this.views[this.currentView].fitToBounds();
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
    this.router.push(slug);
  }

  setTourStops(stops: MapTourType[]) {
    if (this.map) {
      const run = () => {
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
      const run = () => {
        this.tour.setTourPathData(path);
        this.tour.renderPath();
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
      const run = () => {
        this.popup.hide();
        this.clusterDetail.hide();
        this.tour.fitToBounds();
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
      const run = () => {
        this.tour.clear();
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
      const run = () => {
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
      const run = () => {
        this.highlights.clear();
      };
      if (!this.ready) {
        this.onLoadJobs.push(run);
      } else {
        run();
      }
    }
  }

  setUserLocation(lat: number, lng: number) {
    if (this.map) {
      const run = () => {
        const data = {
          features: [
            {
              type: "Feature",
              geometry: {
                coordinates: [lng ?? 0.0, lat ?? 0.0],
                type: "Point",
              },
              properties: {
                id: `userlocation-bg`,
                color: "#fff",
                strokeColor: "#333",
                radius: 20,
                strokeWidth: 2,
              },
            },
            {
              type: "Feature",
              geometry: {
                coordinates: [lng ?? 0.0, lat ?? 0.0],
                type: "Point",
              },
              properties: {
                id: `userlocation-dot`,
                color: "#333",
                strokeColor: "transparent",
                strokeWidth: 0,
                radius: 16,
              },
            },
          ],
          type: "FeatureCollection",
        };

        this.userLocation.setData(data);
        this.userLocation.render();
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
      const run = () => {
        this.userLocation.clear();
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
      const run = () => {
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
      const run = () => {
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
      };

      if (!this.ready) {
        this.onLoadJobs.push(run);
      } else {
        run();
      }
    }
  }
}
