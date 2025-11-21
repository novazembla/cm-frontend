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
  geoJsonAllDataWithoutReducedVisibility: any = null;
  reducedVisibilityTermIds: number[] = [];

  intitiallyFitToBounds: boolean = true;
  isEmbed = false;
  loaded = false;
  firstPanOrMove = true;
  styleLoaded = false;
  baseDataLoaded = false;
  ready = false;
  onLoadJobs: any[] = [];
  currentView = "clustered";
  views: Record<string, any> = {};

  constructor(
    router: NextRouter,
    tHelper: AppTranslationHelper,
    config: AppConfig,
    reducedVisibilityTermIds: number[]
  ) {
    this.map = null;
    this.mapContainerRef = null;
    this.locationId = null;

    this.config = config;
    this.tHelper = tHelper;
    this.reducedVisibilityTermIds = reducedVisibilityTermIds;
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
    const self = this;

    self.mapContainerRef = null;
    self.isEmbed = isEmbed;

    self.ready = false;
    self.styleLoaded = false;
    self.loaded = false;
    self.onLoadJobs = [];

    self.map = new maplibregl.Map({
      container: ref,
      style: self.config.mapStyleJsonUrl,
      center: [self.config.lng, self.config.lat],
      zoom: self.config.zoom,
      maxBounds: self.config.bounds,
      minZoom: self.config.minZoom,
      maxZoom: self.config.maxZoom,
      attributionControl: false,
    });
    self.map.addControl(
      new maplibregl.AttributionControl({
        customAttribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="nofollow noreferrer">OpenStreetMap contributors</a>',
      }),
      "bottom-right"
    );
    self.clusterDetail.init();

    self.onLoadJobs.push(async (resolve?: any) => {
      if (self.currentView in self.views) {
        self.views[self.currentView].setData();
        setTimeout(() => {
          self.views[self.currentView].render();
          if (self.intitiallyFitToBounds) {
            self.views[self.currentView].fitToBounds();
          }
          self.setInitallyFitToBounds(true);
          if (typeof resolve !== "undefined") resolve(true);
        }, 100);
      }
    });

    const process = async () => {
      if (self.ready) return;
      self.ready = true;

      if (typeof setIsLoaded === "function") setIsLoaded.call(null, true);

      self.onLoadJobs.forEach(async (f) => {
        await new Promise(f);
      });
    };

    const maybeProcess = async () => {
      if (self.baseDataLoaded && self.styleLoaded && self.loaded)
        await process();
    };

    self.map.once("style.load", () => {
      self.styleLoaded = true;
      maybeProcess();
    });
    self.map.once("load", () => {
      self.loaded = true;

      self?.map?.on("movestart", (e) => {
        self.isAnimating = (e as any)?.cmAnimation === true;
      });

      self?.map?.on("moveend", (e) => {
        if (!self.map) return;
        self.isAnimating = false;
        if (self.map.getZoom() > self.config.maxZoom - 1) {
          self.map.zoomTo(
            self.config.maxZoom - 1.1,
            {},
            {
              cmAnimation: true,
            }
          );
        }
      });
      maybeProcess();
    });

    if (typeof window !== "undefined") {
      fetch(`${self.config.apiUrl}/geojson`).then(async (response) => {
        if (response.ok) {
          const data = await response.json();
          
          if (
            data &&
            data?.type &&
            data?.features &&
            data.type === "FeatureCollection" &&
            Array.isArray(data.features)
          ) {
            self.geoJsonAllData = data;


            self.geoJsonAllDataWithoutReducedVisibility = {
              type: data?.type,
              features: data.features.filter((feature: any) =>
                !this.reducedVisibilityTermIds.includes(
                  feature?.properties?.primaryTermId ?? 0
                )
              ),
            }; 

            self.baseDataLoaded = true;

            maybeProcess();
          }
        }
      });
    }
  }

  inBounds = (coordinates: number[]) => {
    if (
      coordinates[0] < this.config.bounds[0][0] ||
      coordinates[0] > this.config.bounds[1][0]
    )
      return false;
    if (
      coordinates[1] < this.config.bounds[0][1] ||
      coordinates[1] > this.config.bounds[1][1]
    )
      return false;
    return true;
  };

  fitToBounds = (bounds: any, options: any = {}) => {
    if (!this.map) return;

    const calculatedOptions: any = this.map.cameraForBounds(bounds, options);

    if (!calculatedOptions) return;

    for (const k in options) {
      calculatedOptions[k] = options[k];
    }

    calculatedOptions.zoom = Math.max(
      calculatedOptions.zoom,
      options?.minZoom ?? this.config.boundingBoxZoom
    );

    // Explictly remove the padding field because, calculatedOptions already accounts for padding by setting zoom and center accordingly.
    if (calculatedOptions?.padding) delete calculatedOptions.padding;

    if (calculatedOptions?.minZoom) delete calculatedOptions.minZoom;

    this.map.easeTo(options);
  };

  clearOnloadJobs = () => (this.onLoadJobs = []);

  setInitallyFitToBounds = (flag: boolean) =>
    (this.intitiallyFitToBounds = flag);

  setCenter(lng: number, lat: number) {
    const self = this;
    if (self.map) {
      self.map.setCenter([lng, lat]);
    }
  }
  
  setView(view: string) {
    const self = this;
    if (self.map) {
      const run = async (resolve?: any) => {
        Object.keys(self.views).forEach((v: string) => {
          if (v !== view) {
            self.views[v].clear();
          }
        });
        self.popup.hide();
        self.clusterDetail.hide();
        self.views[view].setData();

        setTimeout(() => {
          self.views[view].render();
          self.views[view].show();
          if (typeof resolve !== "undefined") resolve(true);
        }, 100);

        self.currentView = view;
      };

      if (view === self.currentView && self.views[view]?.isDataSet) return;

      if (!self.ready) {
        self.currentView = view;
        self.onLoadJobs.push(run);
      } else {
        run();
      }
    }
  }

  hideCurrentView() {
    const self = this;
    if (self.map) {
      const run = async (resolve?: any) => {
        self.popup.hide();
        self.clusterDetail.hide();
        self.views[self.currentView].hide();
        if (typeof resolve !== "undefined") resolve(true);
      };
      if (!self.ready) {
        self.onLoadJobs.push(run);
      } else {
        run();
      }
    }
  }

  showCurrentView() {
    const self = this;
    if (self.map) {
      const run = async (resolve?: any) => {
        self.popup.hide();
        self.clusterDetail.hide();
        self.views[self.currentView].show();

        if (typeof resolve !== "undefined") resolve(true);
      };
      if (!self.ready) {
        self.onLoadJobs.push(run);
      } else {
        run();
      }
    }
  }

  renderCurrentView() {
    const self = this;
    if (self.map) {
      const run = async (resolve?: any) => {
        self.popup.hide();
        self.clusterDetail.hide();
        self.views[self.currentView].render();
        if (typeof resolve !== "undefined") resolve(true);
      };
      if (!self.ready) {
        self.onLoadJobs.push(run);
      } else {
        run();
      }
    }
  }

  setCurrentViewData(data?: any, show?: boolean) {
    const self = this;
    if (self.map) {
      const run = async (resolve?: any) => {
        self.popup.hide();
        self.clusterDetail.hide();
        self.views[self.currentView].setData(data);

        if (show) {
          setTimeout(() => {
            self.views[self.currentView].show();
            if (typeof resolve !== "undefined") resolve(true);
          }, 100);
        }
      };

      if (!self.ready) {
        self.onLoadJobs.push(run);
      } else {
        run();
      }
    }
  }

  setFilteredViewData(ids: any[]) {
    const self = this;
    if (self.map) {
      const run = async (resolve?: any) => {
        self.popup.hide();
        self.clusterDetail.hide();

        if (self.geoJsonAllData && self.geoJsonAllData?.features?.length) {
          self.views[self.currentView].setData({
            type: "FeatureCollection",
            features: self.geoJsonAllData?.features.filter((f: any) =>
              ids.includes(f?.properties?.id)
            ),
          });
          if (typeof resolve !== "undefined") resolve(true);
        } else {
          self.views[self.currentView].setData({
            type: "FeatureCollection",
            features: [],
          });
          setTimeout(() => {
            self.views[self.currentView].show();
            if (typeof resolve !== "undefined") resolve(true);
          }, 100);
        }
      };

      if (!self.ready) {
        self.onLoadJobs.push(run);
      } else {
        run();
      }
    }
  }

  fitToCurrentViewBounds() {
    const self = this;
    if (self.map) {
      const run = async (resolve?: any) => {
        self.popup.hide();
        self.clusterDetail.hide();
        self.views[self.currentView].fitToBounds();
        if (typeof resolve !== "undefined") resolve(true);
      };

      if (!self.ready) {
        self.onLoadJobs.push(run);
      } else {
        run();
      }
    }
  }

  onMapPointNavigate(slug: any) {
    const self = this;

    if (!slug) return null;

    self.popup.hide();

    if (self.isEmbed && typeof window !== "undefined") {
      window.open(`${self.config.baseUrl}${slug}`, "_ blank");
    } else {
      self.router.push(slug);
    }
  }

  setTourStops(stops: MapTourType[]) {
    const self = this;
    if (self.map) {
      const run = async (resolve?: any) => {
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

        self.tour.setTourStopsData(stopsGeoJSON);
        self.tour.renderStops();
        if (typeof resolve !== "undefined") resolve(true);
      };
      if (!self.ready) {
        self.onLoadJobs.push(run);
      } else {
        run();
      }
    }
  }

  setTourPath(path: any) {
    const self = this;
    if (self.map) {
      const run = async (resolve?: any) => {
        self.tour.setTourPathData(path);
        self.tour.renderPath();
        if (typeof resolve !== "undefined") resolve(true);
      };
      if (!self.ready) {
        self.onLoadJobs.push(run);
      } else {
        run();
      }
    }
  }

  fitToCurrentTourBounds() {
    const self = this;
    if (self.map) {
      const run = async (resolve?: any) => {
        self.popup.hide();
        self.clusterDetail.hide();
        self.tour.fitToBounds();
        if (typeof resolve !== "undefined") resolve(true);
      };

      if (!self.ready) {
        self.onLoadJobs.push(run);
      } else {
        run();
      }
    }
  }

  clearTour() {
    const self = this;
    if (self.map) {
      const run = async (resolve?: any) => {
        self.tour.clear();
        self.setView("clustered");
        if (typeof resolve !== "undefined") resolve(true);
      };
      if (!self.ready) {
        self.onLoadJobs.push(run);
      } else {
        run();
      }
    }
  }

  setHighlights(highlights: MapHighlightType[]) {
    const self = this;
    if (self.map) {
      const run = async (resolve?: any) => {
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

        self.highlights.setData(data);
        self.highlights.render();
        if (typeof resolve !== "undefined") resolve(true);
      };
      if (!self.ready) {
        self.onLoadJobs.push(run);
      } else {
        run();
      }
    }
  }

  clearHighlights() {
    const self = this;
    if (self.map) {
      const run = async (resolve?: any) => {
        self.highlights.clear();
        if (typeof resolve !== "undefined") resolve(true);
      };
      if (!self.ready) {
        self.onLoadJobs.push(run);
      } else {
        run();
      }
    }
  }

  setUserLocation(lng: number, lat: number) {
    const self = this;
    if (self.map) {
      const run = async (resolve?: any) => {
        self.userLocation.setData(lng, lat);
        self.userLocation.render();
        if (typeof resolve !== "undefined") resolve(true);
      };
      if (!self.ready) {
        self.onLoadJobs.push(run);
      } else {
        run();
      }
    }
  }

  clearUserLocation() {
    const self = this;
    if (self.map) {
      const run = async (resolve?: any) => {
        self.userLocation.clear();
        if (typeof resolve !== "undefined") resolve(true);
      };
      if (!self.ready) {
        self.onLoadJobs.push(run);
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
      return [(window.innerWidth - 725) / 2, 40];
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
    const self = this;
    if (self.map) {
      const run = async (resolve?: any) => {
        if (isNaN(lng) || isNaN(lat)) return;
        self.map?.stop();
        self.map?.setPadding({
          top: 0,
          right: 0,
          bottom: 0,
          left: 0,
        });
        self.map?.panTo(
          [lng, lat],
          {
            animate: true,
            duration: 1000,
            essential: true,
            offset: self.getCenterOffset(withDrawer, withVerticalScroller),
          },
          {
            cmAnimation: true,
          }
        );
        if (typeof resolve !== "undefined") resolve(true);
      };

      if (!self.ready) {
        self.onLoadJobs.push(run);
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
    const self = this;
    if (self.map) {
      const run = async (resolve?: any) => {
        if (isNaN(lng) || isNaN(lat)) return;
        self.map?.stop();
        self.map?.setPadding({
          top: 0,
          right: 0,
          bottom: 0,
          left: 0,
        });
        self.map?.panTo(
          [lng, lat],
          {
            animate: false,
            duration: 0,
            essential: false,
            offset: self.getCenterOffset(withDrawer, withVerticalScroller),
          },
          {
            cmAnimation: true,
          }
        );
        if (typeof resolve !== "undefined") resolve(true);
      };

      if (!self.ready) {
        self.onLoadJobs.push(run);
      } else {
        run();
      }
    }
  }

  panOrMoveTo(
    lng: number,
    lat: number,
    withDrawer?: boolean,
    withVerticalScroller?: boolean
  ) {
    const self = this;
    if (self.map) {
      if (self.firstPanOrMove) {
        self.moveTo(lng, lat, withDrawer, withVerticalScroller);
        self.firstPanOrMove = false;
      } else {
        self.panTo(lng, lat, withDrawer, withVerticalScroller);
      } 
    }
  }

  toggleLayersVisibility = (layers: string[], visibility: string) => {
    const self = this;
    if (!self.map) return;

    layers.forEach((l) => {
      if (this?.map?.getLayer(l)) {
        this?.map?.setLayoutProperty(l, "visibility", visibility);
      }
    });
  };

  removeLayers = (layers: string[]) => {
    const self = this;
    if (!self.map) return;

    layers.forEach((l) => {
      if (this?.map?.getLayer(l)) {
        self.map?.removeLayer(l);
      }
    });
  };
}
