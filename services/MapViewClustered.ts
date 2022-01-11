import maplibregl from "maplibre-gl";
import { primaryInput } from "detect-it";
import type { CultureMap } from "./CultureMap";

export class MapViewClustered {
  cultureMap: CultureMap;
  bounds: maplibregl.LngLatBounds;
  events: Record<string, any> = {};
  isVisible: boolean = false;

  layers: string[] = ["clusters", "cluster-count", "clustered-locations"];

  constructor(cultureMap: CultureMap) {
    this.cultureMap = cultureMap;
    this.bounds = new maplibregl.LngLatBounds(
      [this.cultureMap.config.lng, this.cultureMap.config.lat],
      [this.cultureMap.config.lng, this.cultureMap.config.lat]
    );
  }

  setData(data?: any) {
    if (this.cultureMap?.map) {
      if (!this.cultureMap?.map) return;

      this.hide();

      if (!this.cultureMap.map.getSource("clustered-locations")) {
        this.cultureMap.map.addSource("clustered-locations", {
          type: "geojson",
          data: data ?? this.cultureMap.geoJsonAllData ?? {},
          cluster: true,
          maxzoom: this.cultureMap.config.maxZoom,
          clusterMaxZoom: this.cultureMap.config.maxZoom, // Max zoom to cluster points on
          clusterRadius: 50, // Radius of each cluster when clustering points (defaults to 50)
        });
      } else {
        (
          this.cultureMap?.map?.getSource("clustered-locations") as any
        )?.setData(data ?? this.cultureMap.geoJsonAllData ?? {});
      }

      let bounds: maplibregl.LngLatBounds | undefined;

      if ((data ?? this.cultureMap.geoJsonAllData ?? {})?.features?.length) {
        for (
          let i = 0;
          i < (data ?? this.cultureMap.geoJsonAllData ?? {})?.features?.length;
          i++
        ) {
          const coordinates = (data ?? this.cultureMap.geoJsonAllData ?? {})
            ?.features[i]?.geometry?.coordinates ?? [
            this.cultureMap.config.lng,
            this.cultureMap.config.lat,
          ];

          if (coordinates[0] !== 0 && coordinates[1] !== 0) {
            if (!bounds) {
              bounds = new maplibregl.LngLatBounds(coordinates, coordinates);
            } else {
              bounds.extend(coordinates);
            }
          }
        }
      }
      if (bounds) {
        this.bounds = bounds;
      } else {
        this.bounds = new maplibregl.LngLatBounds(
          [this.cultureMap.config.lng, this.cultureMap.config.lat],
          [this.cultureMap.config.lng, this.cultureMap.config.lat]
        );
      }
    }
  }

  render() {
    if (this.cultureMap?.map) {
      if (
        !this.cultureMap?.map ||
        !this.cultureMap.map.getSource("clustered-locations")
      )
        return;

      this.clear();

      this.cultureMap.map.addLayer({
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
          "circle-color": this.cultureMap.config.colorDark,
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

      this.cultureMap.map.addLayer({
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

      this.cultureMap.map.addLayer({
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

      this.cultureMap.map.on("click", "clusters", (e) => {
        if (this.cultureMap.clickBlock || !this.cultureMap.map) return;

        const features = this.cultureMap.map.queryRenderedFeatures(e.point, {
          layers: ["clusters"],
        });
        if (!features?.length) {
          this.cultureMap.clusterDetail.hide();
        }
      });

      // inspect a cluster on click
      this.events["click-clusters"] = (e: any) => {
        if (!this.cultureMap?.map) return;

        var features = this.cultureMap.map.queryRenderedFeatures(e.point, {
          layers: ["clusters"],
        });
        if (!features?.length) return;
        var clusterId = features[0].properties.cluster_id;
        if (!clusterId) return;
        const clusterSource = (this.cultureMap.map as any).getSource(
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
                if (err || !this.cultureMap?.map) return;
                if (
                  (children?.length > 1 && children[0].properties?.cluster) ||
                  Math.floor(zoom) < this.cultureMap.config.maxZoom - 2
                ) {
                  this.cultureMap.map.easeTo(
                    {
                      center: features[0].geometry.coordinates,
                      offset: this.cultureMap.getCenterOffset() ?? [0, 0],
                      zoom: Math.min(zoom, this.cultureMap.config.maxZoom - 2),
                    },
                    {
                      cmAnimation: true,
                    }
                  );
                  this.cultureMap.clusterDetail.hide();
                } else {
                  this.cultureMap.map.easeTo(
                    {
                      center: features[0].geometry.coordinates,
                      offset: this.cultureMap.getCenterOffset() ?? [0, 0],
                      zoom: Math.max(
                        17.5,
                        Math.min(
                          this.cultureMap.map.getZoom(),
                          this.cultureMap.config.maxZoom - 1.1
                        )
                      ),
                    },
                    {
                      cmAnimation: true,
                    }
                  );
                  this.cultureMap.overlayZoomLevel =
                    this.cultureMap.map.getZoom();
                  clusterSource.getClusterLeaves(
                    clusterId,
                    100,
                    0,
                    (err: any, leafFeatures: any) => {
                      if (err || !leafFeatures?.length) return;
                      const coordinates =
                        features[0].geometry.coordinates.slice();
                      this.cultureMap.clusterDetail.show(
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
      this.cultureMap.map.on(
        "click",
        "clusters",
        this.events["click-clusters"]
      );

      this.events["mouseenter-clusters"] = () => {
        if (!this.cultureMap.map) return;
        this.cultureMap.map.getCanvas().style.cursor = "pointer";
      };
      this.cultureMap.map.on(
        "mouseenter",
        "clusters",
        this.events["mouseenter-clusters"]
      );

      this.events["mouseleave-clusters"] = () => {
        if (!this.cultureMap.map) return;
        this.cultureMap.map.getCanvas().style.cursor = "";
      };
      this.cultureMap.map.on(
        "mouseleave",
        "clusters",
        this.events["mouseleave-clusters"]
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
            this.cultureMap.tHelper.i18n?.language === "en" ? "location" : "ort"
          }/${this.cultureMap.tHelper.getMultilangValue(
            JSON.parse(feature?.properties?.slug)
          )}`;

          this.cultureMap.popup.show(
            coordinates,
            this.cultureMap.tHelper.getMultilangValue(titles),
            feature?.properties?.color,
            slug
          );
        } catch (err) {}
      };

      this.events["zoom"] = () => {
        if (this.cultureMap.isAnimating) return;

        if (
          this.cultureMap.map &&
          (this.cultureMap.map.getZoom() <
            this.cultureMap.overlayZoomLevel -
              this.cultureMap.ZOOM_LEVEL_HIDE_ADJUSTOR ||
            this.cultureMap.map.getZoom() >
              this.cultureMap.overlayZoomLevel +
                this.cultureMap.ZOOM_LEVEL_HIDE_ADJUSTOR)
        ) {
          this.cultureMap.overlayZoomLevel = 0;
          this.cultureMap.clusterDetail.hide();
          this.cultureMap.popup.hide();
        }
      };
      this.cultureMap.map.on("zoom", this.events["zoom"]);

      if (primaryInput !== "touch") {
        this.events["mouseenter-clustered-locations"] = (e: any) => {
          if (this.cultureMap.isAnimating) return;
          if (this.cultureMap.map) {
            // Change the cursor style as a UI indicator.
            this.cultureMap.map.getCanvas().style.cursor = "pointer";
            if (e?.features?.[0]) showMapPop(e);
          }
        };

        this.cultureMap.map.on(
          "mouseenter",
          "clustered-locations",
          this.events["mouseenter-clustered-locations"]
        );

        this.events["mouseleave-clustered-locations"] = () => {
          if (this.cultureMap.map) {
            this.cultureMap.map.getCanvas().style.cursor = "";
            this.cultureMap.popup.hide();
          }
        };

        this.cultureMap.map.on(
          "mouseleave",
          "clustered-locations",
          this.events["mouseleave-clustered-locations"]
        );
      }

      this.events["click-clustered-locations"] = (e: any) => {
        if (primaryInput !== "touch") {
          this.cultureMap.clusterDetail.hide();
          if (e?.features?.[0]?.properties?.slug) {
            try {
              const slug = `/${
                this.cultureMap.tHelper.i18n?.language === "en"
                  ? "location"
                  : "ort"
              }/${this.cultureMap.tHelper.getMultilangValue(
                JSON.parse(e?.features?.[0]?.properties?.slug)
              )}`;

              this.cultureMap.onMapPointNavigate(slug);
            } catch (err) {}
          }
        } else {
          if (e?.features?.[0]?.properties) showMapPop(e);
        }
      };

      this.cultureMap.map.on(
        "click",
        "clustered-locations",
        this.events["click-clustered-locations"]
      );

      this.show();
    }
  }

  setFilter(filter: any) {
    if (this.cultureMap?.map) {
      if (this.cultureMap.map?.getLayer("unclustered-locations"))
        this.cultureMap.map.setFilter("unclustered-locations", filter);
      //["match", ["get", "id"], ["loc-1", "loc-2", "loc-3", "loc-4", "loc-5", "loc-8", "loc-10"], true, false]
    }
  }

  fitToBounds() {
    if (this.cultureMap?.map) {
      this.cultureMap.map?.fitBounds(this.bounds, {
        maxZoom: this.cultureMap.MAX_BOUNDS_ZOOM,
        linear: true,
        padding: this.cultureMap.getBoundsPadding(),
      });
    }
  }

  hide() {
    if (!this.isVisible) return;

    this.cultureMap.toggleLayersVisibility(this.layers, "none");

    this.isVisible = false;
  }

  show() {
    if (this.isVisible) return;

    this.cultureMap.toggleLayersVisibility(this.layers, "visible");

    this.isVisible = true;
  }

  clear() {
    if (this.cultureMap?.map) {
      this.isVisible = false;

      this.cultureMap.removeLayers(this.layers);

      if (Object.keys(this.events).length) {
        Object.keys(this.events).forEach((key) => {
          if (this.cultureMap?.map) {
            const params: string[] = key.split("-");
            if (params.length > 1) {
              this.cultureMap.map.off(
                params[0] as any,
                params[1],
                this.events[key]
              );
            } else {
              this.cultureMap.map.off(key, this.events[key]);
            }
          }
        });
        this.events = {};
      }
    }
  }
}
