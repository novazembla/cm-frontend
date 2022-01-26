import maplibregl from "maplibre-gl";
import { primaryInput } from "detect-it";
import type { CultureMap } from "./CultureMap";
import { MapSpiderfier } from "./MapSpiderfier";

export class MapClusterDetail {
  cultureMap: CultureMap;
  spiderfier: MapSpiderfier | null = null;
  clickBlock = false;
  clusterDetailOpen = false;
  clusterDetail: any = null;
  clusterDetailAnimating = false;
  clusterDetailClusterHash: string | null = null;

  constructor(cultureMap: CultureMap) {
    this.cultureMap = cultureMap;
  }

  init() {
    const self = this;
    if (!self.cultureMap.map) return;

    self.spiderfier = new MapSpiderfier(self.cultureMap.map, {
      color: self.cultureMap.config.colorDark,
      dotRadius: 16,
      clusterRadius: 24,
      onClick: (e: any, spiderLeg: any) => {
        if (primaryInput === "mouse") {
          const slug = `/${
            self.cultureMap.tHelper.i18n?.language === "en"
              ? "location"
              : "ort"
          }/${self.cultureMap.tHelper.getMultilangValue(
            spiderLeg?.feature?.slug
          )}`;

          self.cultureMap.onMapPointNavigate(slug);
        }
      },
      initializeLeg: (spiderLeg: any) => {
        const showLegPopup = (e: any) => {
          if (self.cultureMap.isAnimating) return;

          self.cultureMap.clickBlock = true;
          e.preventDefault();

          self.cultureMap.overlayZoomLevel =
            self.cultureMap?.map?.getZoom() ?? 0;

          self.cultureMap.popup.show(
            spiderLeg.latLng,
            self.cultureMap.tHelper.getMultilangValue(
              spiderLeg?.feature?.title
            ),
            spiderLeg?.feature?.color,
            self.cultureMap.tHelper.getMultilangValue(spiderLeg?.feature?.slug),
            [
              spiderLeg.popupOffset.bottom[0] +
                (primaryInput === "mouse"
                  ? self.cultureMap.POPUP_OFFSET_MOUSE[0]
                  : self.cultureMap.POPUP_OFFSET_TOUCH[0]),
              spiderLeg.popupOffset.bottom[1] +
                (primaryInput === "mouse"
                  ? self.cultureMap.POPUP_OFFSET_MOUSE[1]
                  : self.cultureMap.POPUP_OFFSET_TOUCH[1]),
            ]
          );

          setTimeout(() => {
            self.cultureMap.clickBlock = false;
          }, 100);
        };

        if (primaryInput === "mouse") {
          spiderLeg.elements.pin.addEventListener("mouseenter", showLegPopup);

          spiderLeg.elements.pin.addEventListener("mouseleave", () => {
            self.cultureMap.popup.hide();
          });
        } else {
          spiderLeg.elements.pin.addEventListener("click", showLegPopup);
        }
      },
    });
  }

  show(coordinates: [number, number], leafFeatures: any) {
    const self = this;
    if (!self.spiderfier) return;

    const newHash = `${coordinates[0].toFixed(6)}-${coordinates[1].toFixed(6)}`;
    if (self.clusterDetailOpen && self.clusterDetailClusterHash !== newHash) {
      self.spiderfier.unspiderfy();
      self.clusterDetailOpen = false;
      self.clusterDetailAnimating = false;
    }

    if (
      !self.clusterDetailClusterHash ||
      (!self.clusterDetailOpen && !self.clusterDetailAnimating)
    ) {
      self.clusterDetail = self.spiderfier.spiderfy(
        coordinates,
        leafFeatures.map((leafFeature: any) => {
          return leafFeature.properties;
        })
      );
      self.clusterDetailClusterHash = newHash;

      setTimeout(() => {
        self.clusterDetail?.map((e: any) =>
          e?.elements?.container?.classList.add("fadeIn")
        );
        setTimeout(() => {
          self.clusterDetailAnimating = true;
        }, 200);
      }, 20);
      self.clusterDetailOpen = true;
    }
  }

  hide() {
    const self = this;
    const currentHash = self.clusterDetailClusterHash;
    if (!self.spiderfier || !self.clusterDetailOpen) return;

    self.clusterDetail?.map((e: any) =>
      e?.elements?.container?.classList.add("fadeOut")
    );

    setTimeout(() => {
      if (self.clusterDetailClusterHash === currentHash) {
        self.clusterDetailAnimating = false;
        self.spiderfier?.unspiderfy();
        self.clusterDetailOpen = false;
        self.clusterDetailClusterHash = null;
        self.clusterDetail = null;
      }
    }, 200);
  }
}
