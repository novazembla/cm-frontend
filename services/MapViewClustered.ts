import maplibregl from "maplibre-gl";
import { primaryInput } from "detect-it";
import type { CultureMap } from "./CultureMap";

export class MapViewClustered {
  cultureMap: CultureMap;
  bounds: maplibregl.LngLatBounds;
  events: Record<string, any> = {};
  isVisible: boolean = false;
  isDataSet: boolean = false;

  layers: string[] = ["clusters", "cluster-count", "clustered-locations"];

  constructor(cultureMap: CultureMap) {
    this.cultureMap = cultureMap;
    this.bounds = new maplibregl.LngLatBounds(
      [this.cultureMap.config.lng, this.cultureMap.config.lat],
      [this.cultureMap.config.lng, this.cultureMap.config.lat]
    );
  }

  setData(data?: any) {
    const self = this;
    if (self.cultureMap?.map) {
      if (!self.cultureMap?.map) return;

      self.hide();
      
      if (!self.cultureMap.map.getSource("clustered-locations")) {
        self.cultureMap.map.addSource("clustered-locations", {
          type: "geojson",
          data: data ?? self.cultureMap.geoJsonAllData ?? {},
          cluster: true,
          maxzoom: self.cultureMap.config.maxZoom,
          clusterMaxZoom: self.cultureMap.config.maxZoom, // Max zoom to cluster points on
          clusterRadius: self.cultureMap.config.clusterRadius, // Radius of each cluster when clustering points (defaults to 50)
        });
      } else {
        (
          self.cultureMap?.map?.getSource("clustered-locations") as any
        )?.setData(data ?? self.cultureMap.geoJsonAllData ?? {});
      }

      let bounds: maplibregl.LngLatBounds | undefined;

      if ((data ?? self.cultureMap.geoJsonAllData ?? {})?.features?.length) {
        for (
          let i = 0;
          i < (data ?? self.cultureMap.geoJsonAllData ?? {})?.features?.length;
          i++
        ) {
          const coordinates = (data ?? self.cultureMap.geoJsonAllData ?? {})
            ?.features[i]?.geometry?.coordinates ?? [
            self.cultureMap.config.lng,
            self.cultureMap.config.lat,
          ];

          if (self.cultureMap.inBounds(coordinates)) {
            if (!bounds) {
              bounds = new maplibregl.LngLatBounds(coordinates, coordinates);
            } else {
              bounds.extend(coordinates);
            }
          } else {
            const feature = (data ?? self.cultureMap.geoJsonAllData ?? {})
              ?.features[i];
            console.warn(
              `Skipped location as it is out of bounds: ID(${feature.properties.id.replace(
                "loc-",
                ""
              )}) - ${self.cultureMap.tHelper.getMultilangValue(
                feature?.properties?.title
              )}`
            );
          }
        }
      }
      if (bounds) {
        self.bounds = bounds;
      } else {
        self.bounds = new maplibregl.LngLatBounds(
          [self.cultureMap.config.lng, self.cultureMap.config.lat],
          [self.cultureMap.config.lng, self.cultureMap.config.lat]
        );
      }
      self.isDataSet = true;
    }
  }

  render() {
    const self = this;
    if (self.cultureMap?.map) {
      if (
        !self.cultureMap?.map ||
        !self.cultureMap.map.getSource("clustered-locations")
      )
        return;

      self.clear();

      self.cultureMap.map.addLayer({
        id: "clusters",
        type: "circle",

        source: "clustered-locations",
        filter: ["has", "point_count"],
        layout: {
          visibility: "none",
        },
        paint: {
          // Use step expressions (https://maplibre.org/maplibre-gl-js-docs/style-spec/#expressions-step)
          // with three steps to implement three types of circles:
          //   * Blue, 20px circles when point count is less than 100
          //   * Yellow, 30px circles when point count is between 100 and 750
          //   * Pink, 40px circles when point count is greater than or equal to 750
          "circle-color": self.cultureMap.config.colorDark,
          // "circle-color": [
          //   "step",
          //   ["get", "point_count"],
          //   "#51bbd6",
          //   100,
          //   "#f1f075",
          //   750,
          //   "#f28cb1",
          // ],
          "circle-radius": 24,
          // [
          //   "step",
          //   ["get", "point_count"],
          //   24,
          //   100,
          //   28,
          //   750,
          //   32,
          // ],
        },
      });

      self.cultureMap.map.addLayer({
        id: "cluster-count",
        type: "symbol",
        source: "clustered-locations",
        filter: ["has", "point_count"],
        layout: {
          "text-field": "{point_count_abbreviated}",
          "text-font": ["Berlin Type Bold"],
          "text-size": 13,
          visibility: "none",
        },
        paint: {
          "text-color": "#fff",
        },
      });

      self.cultureMap.map.addLayer({
        id: "clustered-locations",
        type: "circle",
        source: "clustered-locations",
        filter: ["!", ["has", "point_count"]],
        layout: {
          visibility: "none",
        },
        paint: {
          "circle-color": ["get", "color"],
          "circle-radius": 16,
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

      self.cultureMap.map.on("click", "clusters", (e) => {
        if (self.cultureMap.clickBlock || !self.cultureMap.map) return;

        const features = self.cultureMap.map.queryRenderedFeatures(e.point, {
          layers: ["clusters"],
        });
        if (!features?.length) {
          self.cultureMap.clusterDetail.hide();
        }
      });

      // inspect a cluster on click
      self.events["click-clusters"] = (e: any) => {
        if (!self.cultureMap?.map) return;

        var features = self.cultureMap.map.queryRenderedFeatures(e.point, {
          layers: ["clusters"],
        });
        if (!features?.length) return;
        var clusterId = features[0].properties.cluster_id;
        if (!clusterId) return;
        const clusterSource = (self.cultureMap.map as any).getSource(
          "clustered-locations"
        );

        if (!clusterSource) return;

        clusterSource.getClusterChildren(
          clusterId,
          (err: any, children: any) => {
            if (err) return;
            clusterSource.getClusterExpansionZoom(
              clusterId,
              (err: any, zoom: any) => {
                if (err || !self.cultureMap?.map) return;

                if (
                  (children?.length > 1 && children[0].properties?.cluster) ||
                  Math.floor(zoom) < self.cultureMap.config.maxZoom - 2
                ) {
                  self.cultureMap.map.easeTo(
                    {
                      center: (features[0].geometry as any).coordinates,
                      offset: self.cultureMap.getCenterOffset() ?? [0, 0],
                      zoom: Math.min(zoom, self.cultureMap.config.maxZoom - 2),
                    },
                    {
                      cmAnimation: true,
                    }
                  );
                  self.cultureMap.clusterDetail.hide();
                } else {
                  self.cultureMap.map.easeTo(
                    {
                      center: (features[0].geometry as any).coordinates,
                      offset: self.cultureMap.getCenterOffset() ?? [0, 0],
                      zoom: Math.max(
                        17.5,
                        Math.min(
                          self.cultureMap.map.getZoom(),
                          self.cultureMap.config.maxZoom - 1.1
                        )
                      ),
                    },
                    {
                      cmAnimation: true,
                    }
                  );
                  self.cultureMap.overlayZoomLevel =
                    self.cultureMap.map.getZoom();
                  clusterSource.getClusterLeaves(
                    clusterId,
                    100,
                    0,
                    (err: any, leafFeatures: any) => {
                      if (err || !leafFeatures?.length) return;
                      const coordinates = (
                        features[0].geometry as any
                      ).coordinates.slice();
                      self.cultureMap.clusterDetail.show(
                        coordinates,
                        leafFeatures
                      );
                    }
                  );
                }
              }
            );
          }
        );
      };
      self.cultureMap.map.on(
        "click",
        "clusters",
        self.events["click-clusters"]
      );

      self.events["mouseenter-clusters"] = () => {
        if (!self.cultureMap.map) return;
        self.cultureMap.map.getCanvas().style.cursor = "pointer";
      };
      self.cultureMap.map.on(
        "mouseenter",
        "clusters",
        self.events["mouseenter-clusters"]
      );

      self.events["mouseleave-clusters"] = () => {
        if (!self.cultureMap.map) return;
        self.cultureMap.map.getCanvas().style.cursor = "";
      };
      self.cultureMap.map.on(
        "mouseleave",
        "clusters",
        self.events["mouseleave-clusters"]
      );

      const showMapPop = (e: any) => {
        const feature = e?.features?.[0];
        if (!feature) return;
        const coordinates = feature.geometry.coordinates.slice();
        // Ensure that if the map is zoomed out such that multiple
        // copies of the feature are visible, the popup appears
        // over the copy being pointed to.
        while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
          coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
        }
        try {
          const titles = JSON.parse(feature?.properties?.title);

          const slug = `/${
            self.cultureMap.tHelper.i18n?.language === "en" ? "location" : "ort"
          }/${self.cultureMap.tHelper.getMultilangValue(
            JSON.parse(feature?.properties?.slug)
          )}`;

          self.cultureMap.popup.show(
            coordinates,
            self.cultureMap.tHelper.getMultilangValue(titles),
            feature?.properties?.color,
            slug
          );
        } catch (err) {}
      };

      self.events["zoom"] = () => {
        if (self.cultureMap.isAnimating) return;

        if (
          self.cultureMap.map &&
          (self.cultureMap.map.getZoom() <
            self.cultureMap.overlayZoomLevel -
              self.cultureMap.ZOOM_LEVEL_HIDE_ADJUSTOR ||
            self.cultureMap.map.getZoom() >
              self.cultureMap.overlayZoomLevel +
                self.cultureMap.ZOOM_LEVEL_HIDE_ADJUSTOR)
        ) {
          self.cultureMap.overlayZoomLevel = 0;
          self.cultureMap.clusterDetail.hide();
          self.cultureMap.popup.hide();
        }
      };
      self.cultureMap.map.on("zoom", self.events["zoom"]);

      if (primaryInput !== "touch") {
        self.events["mouseenter-clustered-locations"] = (e: any) => {
          if (self.cultureMap.isAnimating) return;
          if (self.cultureMap.map) {
            // Change the cursor style as a UI indicator.
            self.cultureMap.map.getCanvas().style.cursor = "pointer";
            if (e?.features?.[0]) showMapPop(e);
          }
        };

        self.cultureMap.map.on(
          "mouseenter",
          "clustered-locations",
          self.events["mouseenter-clustered-locations"]
        );

        self.events["mouseleave-clustered-locations"] = () => {
          if (self.cultureMap.map) {
            self.cultureMap.map.getCanvas().style.cursor = "";
            self.cultureMap.popup.hide();
          }
        };

        self.cultureMap.map.on(
          "mouseleave",
          "clustered-locations",
          self.events["mouseleave-clustered-locations"]
        );
      }

      self.events["click-clustered-locations"] = (e: any) => {
        if (primaryInput !== "touch") {
          self.cultureMap.clusterDetail.hide();
          if (e?.features?.[0]?.properties?.slug) {
            try {
              const slug = `/${
                self.cultureMap.tHelper.i18n?.language === "en"
                  ? "location"
                  : "ort"
              }/${self.cultureMap.tHelper.getMultilangValue(
                JSON.parse(e?.features?.[0]?.properties?.slug)
              )}`;

              self.cultureMap.onMapPointNavigate(slug);
            } catch (err) {}
          }
        } else {
          if (e?.features?.[0]?.properties) showMapPop(e);
        }
      };

      self.cultureMap.map.on(
        "click",
        "clustered-locations",
        self.events["click-clustered-locations"]
      );

      self.show();
      
      const highlights = self.cultureMap.map.getLayer('highlights');
      if (highlights) {
        self.cultureMap.map.moveLayer("highlights", "clustered-locations");
      }
    }
  }

  setFilter(filter: any) {
    const self = this;
    if (self.cultureMap?.map) {
      if (self.cultureMap.map?.getLayer("unclustered-locations"))
        self.cultureMap.map.setFilter("unclustered-locations", filter);
      //["match", ["get", "id"], ["loc-1", "loc-2", "loc-3", "loc-4", "loc-5", "loc-8", "loc-10"], true, false]
    }
  }

  fitToBounds() {
    const self = this;
    if (self.cultureMap?.map) {
      self.cultureMap.fitToBounds(self.bounds, {
        maxZoom: self.cultureMap.MAX_BOUNDS_ZOOM,
        padding: self.cultureMap.getBoundsPadding(),
      });
    }
  }

  hide() {
    const self = this;
    if (!self.isVisible) return;

    self.cultureMap.toggleLayersVisibility(self.layers, "none");

    self.isVisible = false;
  }

  show() {
    const self = this;
    if (self.isVisible) return;

    self.cultureMap.toggleLayersVisibility(self.layers, "visible");

    self.isVisible = true;
  }

  clear() {
    const self = this;
    if (self.cultureMap?.map) {
      self.isVisible = false;
      self.isDataSet = true;
      self.cultureMap.removeLayers(self.layers);

      if (Object.keys(self.events).length) {
        Object.keys(self.events).forEach((key) => {
          if (self.cultureMap?.map) {
            const params: string[] = key.split("-");
            if (params.length > 1) {
              self.cultureMap.map.off(
                params[0] as any,
                params[1],
                self.events[key]
              );
            } else {
              self.cultureMap.map.off(key as any, self.events[key]);
            }
          }
        });
        self.events = {};
      }
    }
  }
}
