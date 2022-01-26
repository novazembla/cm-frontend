import maplibregl from "maplibre-gl";
import { primaryInput } from "detect-it";
import type { CultureMap } from "./CultureMap";

export class MapPopup {
  locationHash: string = "";

  closeTimeout1: any = null;
  closeTimeout2: any = null;

  popup = new maplibregl.Popup({
    closeButton: false,
    closeOnClick: false,
  });
  popupAnimating = false;
  popupAttached = false;
  cultureMap: CultureMap;

  constructor(cultureMap: CultureMap) {
    this.cultureMap = cultureMap;
  }

  show(
    coordinates: any,
    title: any,
    color: string,
    slug: string,
    offset?: any
  ) {
    const self = this;
    if (!self?.cultureMap?.map) return;

    const hash = `${coordinates[0].toFixed(6)}-${coordinates[1].toFixed(6)}`;

    if (self.popupAttached && self.locationHash === hash) return;

    clearTimeout(self.closeTimeout1);
    clearTimeout(self.closeTimeout2);

    try {
      self.popupAnimating = true;

      self.popup.setOffset(
        offset?.length
          ? offset
          : primaryInput === "mouse"
          ? self.cultureMap.POPUP_OFFSET_MOUSE
          : self.cultureMap.POPUP_OFFSET_TOUCH
      );

      const containerElem: any = document.createElement("div");
      const titleElem: any = document.createElement("div");
      titleElem.className = "title clampThreeLines";
      titleElem.innerText = title;

      const arrowElem: any = document.createElement("a");
      arrowElem.className = "arrow";
      arrowElem.setAttribute("href", "#");
      arrowElem.innerText = this?.cultureMap.tHelper.t(
        "map.popupviewLocation",
        "View location"
      );
      arrowElem.addEventListener("click", (e: any) => {
        if (!this?.cultureMap?.map) return;
        e.preventDefault();
        self.cultureMap.onMapPointNavigate(slug);
        self.hide();
      });
      containerElem.className = "popup";
      containerElem.style.borderColor = color;

      const flexElem: any = document.createElement("div");

      containerElem.appendChild(titleElem);
      containerElem.appendChild(flexElem);

      if (primaryInput === "mouse") {
        flexElem.className = "row";

        containerElem.className = "popup mouse";
        containerElem.addEventListener("mouseenter", () => {
          clearTimeout(self.closeTimeout1);
          clearTimeout(self.closeTimeout2);
        });
        containerElem.addEventListener("mouseleave", () => {
          self.hide();
        });
        containerElem.addEventListener("click", () => {
          if (!this?.cultureMap?.map) return;
          this?.cultureMap.onMapPointNavigate(slug);
          self.hide();
        });
      } else {
        containerElem.className = "popup touch";
        flexElem.className = "row-space-between";
        const closeElem: any = document.createElement("a");
        closeElem.className = "close";
        closeElem.setAttribute("href", "#");
        closeElem.innerText = this?.cultureMap.tHelper.t(
          "map.popupclose",
          "Close popup"
        );
        closeElem.addEventListener("click", (e: any) => {
          e.preventDefault();
          self.hide();
        });
        flexElem.appendChild(closeElem);
      }

      flexElem.appendChild(arrowElem);

      self.locationHash = hash;
      // Populate the popup and set its coordinates
      // based on the feature found.
      self.popup
        .setLngLat(coordinates)
        .setDOMContent(containerElem)
        .addTo(self.cultureMap.map);
      self.popupAttached = true;
      self.cultureMap.overlayZoomLevel = this?.cultureMap?.map?.getZoom() ?? 0;

      setTimeout(() => {
        containerElem.classList.add("fadeIn");
        setTimeout(() => {
          self.popupAnimating = false;
        }, 125);
      }, 20);
    } catch (err) {}
  }

  hide() {
    const self = this;
    if (!this?.cultureMap?.map) return;

    if (!self.popupAttached) return;

    clearTimeout(self.closeTimeout1);
    clearTimeout(self.closeTimeout2);

    self.closeTimeout1 = setTimeout(() => {
      self.popupAnimating = true;
      self.popup
        .getElement()
        ?.querySelector(".popup")
        ?.classList.add("fadeOut");
    }, 60);
    self.closeTimeout2 = setTimeout(() => {
      self.popupAnimating = false;
      self.popup.remove();
      self.popupAttached = false;
      self.locationHash = "";
    }, 185);
  }
}
