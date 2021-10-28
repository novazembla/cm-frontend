import React, { useRef, useState, useEffect, useContext, useMemo } from "react";
import { primaryInput } from "detect-it";

import maplibregl from "maplibre-gl";
import MapCustomSpiderfier from "./MapCustomSpiderify";
import { useAppTranslations } from "~/hooks";

import {
  useMapContext,
  useSettingsContext,
  useConfigContext,
} from "~/provider";
import { useRouter } from "next/router";

const MAP_MIN_ZOOM = 9;
const MAP_MAX_ZOOM = 19;
const ZOOM_LEVEL_HIDE_ADJUSTOR = 0.5;
const POPUP_OFFSET = [0, -20] as [number, number];

let overlayZoomLevel = 0;
let isAnimating = false;

export const Map = () => {
  const router = useRouter();

  const { i18n, getMultilangValue } = useAppTranslations();

  const config = useConfigContext();
  const cultureMap = useMapContext();

  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map>();

  useEffect(() => {
    if (mapRef.current) return; //stops map from intializing more than once

    const map = new maplibregl.Map({
      container: mapContainer.current as HTMLElement,
      style: `https://www.vincentvanuffelen.com/lichtenberg/osm_liberty_culturemap.json`,
      center: [config.lng, config.lat],
      zoom: config.zoom,
      minZoom: MAP_MIN_ZOOM,
      maxZoom: MAP_MAX_ZOOM,
    });
    map.addControl(new maplibregl.NavigationControl(), "bottom-right"); //added

    if (cultureMap) cultureMap.init(map, router);

    mapRef.current = map;

    // Create a popup, but don't add it to the map yet.
    var popup = new maplibregl.Popup({
      closeButton: false,
      closeOnClick: false,
    });

    const onMapPointNavigate = (properties: any) => {
      if (!properties?.slug) return null;

      try {
        const slug =
          typeof properties?.slug === "string"
            ? JSON.parse(properties.slug)
            : properties.slug;
        if (i18n?.language === "en") {
          router.push(`/location/${slug.en}`);
        } else {
          router.push(`/kartenpunkt/${slug.de}`);
        }
      } catch (err) {}
    };

    const spiderfier = new MapCustomSpiderfier(map, {
      color: config.colorDark,
      dotRadius: 16,
      clusterRadius: 24,
      onClick: (e: any, spiderLeg: any) => {
        onMapPointNavigate(spiderLeg.feature);
        popup.remove();
      },
      initializeLeg: (spiderLeg: any) => {
        spiderLeg.elements.pin.addEventListener("mouseenter", () => {
          if (isAnimating) return;

          overlayZoomLevel = map.getZoom();

          popup.setOffset([
            spiderLeg.popupOffset.bottom[0] + POPUP_OFFSET[0],
            spiderLeg.popupOffset.bottom[1] + POPUP_OFFSET[1],
          ]);

          // Populate the popup and set its coordinates
          // based on the feature found.
          popup
            .setLngLat(spiderLeg.latLng)
            // TODO: make more general
            .setHTML(
              `<div style="height: 100px; width: 100px;background-color:#fff;">${getMultilangValue(
                spiderLeg?.feature?.title
              )}</div>`
            )
            .addTo(map);
          popup.addTo(map);
        });

        spiderLeg.elements.pin.addEventListener("mouseleave", () => {
          popup.remove();
        });
      },
    });

    map.on("load", () => {
      map.addSource("locations", {
        type: "geojson",
        data: `${config.apiURL}/geojson`,
        cluster: true,
        clusterMaxZoom: MAP_MAX_ZOOM, // Max zoom to cluster points on
        clusterRadius: 50, // Radius of each cluster when clustering points (defaults to 50)
      });

      // https://bewithjonam.github.io/mapboxgl-spiderifier/docs/example-mapbox-gl-cluster-spiderfy.html

      map.addLayer({
        id: "clusters",
        type: "circle",
        source: "locations",
        filter: ["has", "point_count"],
        paint: {
          // Use step expressions (https://maplibre.org/maplibre-gl-js-docs/style-spec/#expressions-step)
          // with three steps to implement three types of circles:
          //   * Blue, 20px circles when point count is less than 100
          //   * Yellow, 30px circles when point count is between 100 and 750
          //   * Pink, 40px circles when point count is greater than or equal to 750
          "circle-color": config.colorDark,
          // "circle-color": [
          //   "step",
          //   ["get", "point_count"],
          //   "#51bbd6",
          //   100,
          //   "#f1f075",
          //   750,
          //   "#f28cb1",
          // ],
          "circle-radius": 24
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

      map.addLayer({
        id: "cluster-count",
        type: "symbol",
        source: "locations",
        filter: ["has", "point_count"],
        layout: {
          "text-field": "{point_count_abbreviated}",
          "text-font": ["Berlin Type Bold"],
          "text-size": 13,
        },
        paint: {
          "text-color": "#fff",
        },
      });

      map.addLayer({
        id: "cluster-locations",
        type: "circle",
        source: "locations",
        filter: ["!", ["has", "point_count"]],
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

      

      map.on("click", (e) => {
        var features = map.queryRenderedFeatures(e.point, {
          layers: ["clusters"],
        });
        if (!features?.length) spiderfier.unspiderfy();
      });

      // inspect a cluster on click
      map.on("click", "clusters", (e) => {
        var features = map.queryRenderedFeatures(e.point, {
          layers: ["clusters"],
        });

        if (!features?.length) return;

        var clusterId = features[0].properties.cluster_id;

        if (!clusterId) return;

        const clusterSource = (map as any).getSource("locations");

        spiderfier.unspiderfy();

        clusterSource.getClusterChildren(
          clusterId,
          (err: any, children: any) => {
            if (err) return;

            clusterSource.getClusterExpansionZoom(
              clusterId,
              function (err: any, zoom: any) {
                if (err) return;

                if (
                  (children?.length > 1 && children[0].properties?.cluster) ||
                  Math.floor(zoom) !== MAP_MAX_ZOOM - 1
                ) {
                  map.easeTo(
                    {
                      center: features[0].geometry.coordinates,
                      offset: cultureMap?.getCenterOffset() ?? [0, 0],
                      zoom: Math.min(zoom, MAP_MAX_ZOOM - 1),
                    },
                    {
                      cmAnimation: true,
                    }
                  );
                } else {
                  map.easeTo(
                    {
                      center: features[0].geometry.coordinates,
                      offset: cultureMap?.getCenterOffset() ?? [0, 0],
                      zoom: Math.max(
                        16.5,
                        Math.min(map.getZoom(), MAP_MAX_ZOOM - 1.1)
                      ),
                    },
                    {
                      cmAnimation: true,
                    }
                  );

                  overlayZoomLevel = map.getZoom();

                  clusterSource.getClusterLeaves(
                    clusterId,
                    100,
                    0,
                    function (err: any, leafFeatures: any) {
                      if (err || !leafFeatures?.length) return;

                      spiderfier.spiderfy(
                        features[0].geometry.coordinates,
                        leafFeatures.map((leafFeature: any) => {
                          return leafFeature.properties;
                        })
                      );
                    }
                  );
                }
              }
            );
          }
        );
      });

      map.on("movestart", (e) => {
        isAnimating = e?.cmAnimation === true;
      });

      map.on("moveend", (e) => {
        isAnimating = false;

        if (map.getZoom() > MAP_MAX_ZOOM - 1) {
          map.zoomTo(
            MAP_MAX_ZOOM - 1.1,
            {},
            {
              cmAnimation: true,
            }
          );
        }
      });

      map.on("mouseenter", "clusters", () => {
        map.getCanvas().style.cursor = "pointer";
      });
      map.on("mouseleave", "clusters", () => {
        map.getCanvas().style.cursor = "";
      });

      map.on("zoom", () => {
        if (isAnimating) return;

        if (
          map.getZoom() < overlayZoomLevel - ZOOM_LEVEL_HIDE_ADJUSTOR ||
          map.getZoom() > overlayZoomLevel + ZOOM_LEVEL_HIDE_ADJUSTOR
        ) {
          overlayZoomLevel = 0;
          spiderfier.unspiderfy();
          popup.remove();
        }
      });

      if (primaryInput !== "touch") {
        map.on("mouseenter", "cluster-locations", (e: any) => {
          if (isAnimating) return;

          // Change the cursor style as a UI indicator.
          map.getCanvas().style.cursor = "pointer";

          const coordinates = e.features[0].geometry.coordinates.slice();
          // var description = e.features[0].properties.title;

          try {
            const titles = JSON.parse(e.features[0].properties.title);

            // Ensure that if the map is zoomed out such that multiple
            // copies of the feature are visible, the popup appears
            // over the copy being pointed to.
            while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
              coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
            }

            // TODO:, skip if zoom level too low ..

            // [x offset, y offest]
            popup.setOffset(POPUP_OFFSET);

            // Populate the popup and set its coordinates
            // based on the feature found.
            popup
              .setLngLat(coordinates)
              .setHTML(
                `<div style="height: 100px; width: 100px;background-color:#fff;">${getMultilangValue(
                  titles
                )}</div>`
              )
              .addTo(map);

            overlayZoomLevel = map.getZoom();
          } catch (err) {}
        });

        map.on("mouseleave", "cluster-locations", () => {
          map.getCanvas().style.cursor = "";
          popup.remove();
        });
      }

      map.on("click", "cluster-locations", (e: any) => {
        if (primaryInput !== "touch") {
          spiderfier.unspiderfy();
          if (e?.features?.[0]?.properties?.slug) {
            onMapPointNavigate(e?.features?.[0]?.properties);
          }
        }
      });
    });
  });

  return (
    <div className="map-wrap">
      <div ref={mapContainer} className="map" />
    </div>
  );
};

export default Map;
