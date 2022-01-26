// Thank you!
// https://github.com/bewithjonam/mapboxgl-spiderifier
// and https://github.com/ohrie/maplibre-spiderfier

import maplibregl from "maplibre-gl";

export class MapCustomSpiderfier {
  map: maplibregl.Map;
  util: any;
  options: any;
  twoPi: number;
  previousSpiderLegs: any;

  // pin: L.Marker | undefined;
  // map: L.Map | undefined;

  // storePoint: (geolocation: GeoLocation) => void;

  constructor(map: maplibregl.Map, userOptions: any) {
    this.map = map;
    this.options = {
      color: "transparent",
      customPin: false, // If false, sets a default icon for pins in spider legs.
      initializeLeg: () => {},
      onClick: () => {},
      // --- <SPIDER TUNING Params>
      // circleSpiralSwitchover: show spiral instead of circle from this marker count upwards
      //                        0 -> always spiral; Infinity -> always circle
      circleSpiralSwitchover: 12,
      spiralFootSeparation: 28, // related to size of spiral (experiment!)
      spiralLengthStart: 15, // ditto
      spiralLengthFactor: 4, // ditto
      dotRadius: 16,
      clusterRadius: 20,
      // ---
    };
    this.twoPi = Math.PI * 2;
    this.previousSpiderLegs = [];

    for (var attrname in userOptions) {
      this.options[attrname] = userOptions[attrname];
    }
  }

  spiderfy(latLng: any, features: any) {
    const self = this;
    var spiderLegParams = self.generateSpiderLegParams(features.length);
    var spiderLegs: any;

    spiderLegs = features.map((feature: any, index: number) => {
      var spiderLegParam = spiderLegParams[index];
      var elements = self.createMarkerElements(spiderLegParam, feature);
      var maplibreMarker;
      var spiderLeg: any;

      maplibreMarker = new maplibregl.Marker(elements.container).setLngLat(
        latLng
      );

      spiderLeg = {
        latLng,
        feature,
        elements,
        maplibreMarker,
        param: spiderLegParam,
      };

      spiderLeg = {
        ...spiderLeg,
        popupOffset: self.popupOffsetForSpiderLeg(spiderLeg),
      };

      self.options.initializeLeg(spiderLeg);

      elements.container.onclick = (e: any) => {
        self.options.onClick(e, spiderLeg);
      };

      return spiderLeg;
    });

    self.each((spiderLeg: any) => {
      spiderLeg.maplibreMarker.addTo(self.map);
    }, spiderLegs.reverse());

    self.previousSpiderLegs = spiderLegs;

    return spiderLegs;
  }

  unspiderfy() {
    const self = this;
    self.each((spiderLeg: any, index: any) => {
      spiderLeg.maplibreMarker.remove();
    }, self.previousSpiderLegs.reverse());
    self.previousSpiderLegs = [];
  }

  generateSpiderLegParams(count: any) {
    const self = this;
    if (count >= self.options.circleSpiralSwitchover) {
      return self.generateSpiralParams(count);
    } else {
      return self.generateCircleParams(count);
    }
  }

  generateSpiralParams(count: any) {
    const self = this;
    var legLength = self.options.spiralLengthStart,
      angle = 0;
    return self.mapTimes(count, (index: any) => {
      var pt;
      angle =
        angle +
        (self.options.spiralFootSeparation / legLength + index * 0.0005);
      pt = {
        x: legLength * Math.cos(angle),
        y: legLength * Math.sin(angle),
        angle: angle,
        legLength: legLength,
        index: index,
      };
      legLength =
        legLength + (self.twoPi * self.options.spiralLengthFactor) / angle;
      return pt;
    });
  }

  generateCircleParams(count: any) {
    const self = this;
    const circumference =
        (self.options.clusterRadius +
          self.options.dotRadius +
          12 +
          (count > 6 ? self.options.dotRadius : 0)) *
        2 *
        (self.twoPi / 2),
      legLength = circumference / self.twoPi, // = radius from circumference
      angleStep = self.twoPi / count;

    return self.mapTimes(count, function (index: any) {
      var angle = index * angleStep;
      return {
        x: legLength * Math.cos(angle),
        y: legLength * Math.sin(angle),
        angle: angle,
        legLength: legLength,
        index: index,
      };
    });
  }

  createMarkerElements(spiderLegParam: any, feature: any) {
    const self = this;
    const containerElem: any = document.createElement("div"),
      pinElem: any = document.createElement("div");
    // , lineElem: any = document.createElement("div")
    containerElem.setAttribute("data-id", feature?.id);
    containerElem.className = "spider-leg-container";
    // lineElem.className = "spider-leg-line";
    pinElem.className =
      "spider-leg-pin" + (self.options.customPin ? "" : " default-spider-pin");

    // containerElem.appendChild(lineElem);
    containerElem.appendChild(pinElem);

    pinElem.style["background-color"] = feature?.color ?? self.options.color;

    containerElem.style["margin-left"] = spiderLegParam.x + "px";
    containerElem.style["margin-top"] = spiderLegParam.y + "px";

    // lineElem.style.height = spiderLegParam.legLength + "px";
    // // lineElem.style.transform = 'rotate(' + (2*Math.PI - spiderLegParam.angle) +'rad)';
    // lineElem.style.transform =
    //   "rotate(" + (spiderLegParam.angle - Math.PI / 2) + "rad)";

    return {
      container: containerElem,
      // line: lineElem,
      pin: pinElem,
    };
  }

  // Utility
  each(callback: any, arr?: any) {
    const self = this;
    (arr ?? self.previousSpiderLegs).forEach(callback);
  }

  eachFn(arr: any, iterator: any) {
    let i = 0;
    if (!arr || !arr.length) {
      return [];
    }
    for (i = 0; i < arr.length; i++) {
      iterator(arr[i], i);
    }
  }

  eachTimesFn(count: any, iterator: any) {
    if (!count) {
      return [];
    }
    for (var i = 0; i < count; i++) {
      iterator(i);
    }
  }

  mapFn(arr: any, iterator: any) {
    const self = this;
    const result: any = [];
    self.eachFn(arr, function (item: any, i: any) {
      result.push(iterator(item, i));
    });
    return result;
  }

  mapTimes(count: any, iterator: any) {
    const self = this;
    const result: any[] = [];
    self.eachTimesFn(count, function (i: number) {
      result.push(iterator(i));
    });
    return result;
  }

  popupOffsetForSpiderLeg(spiderLeg: any, offset?: any) {
    const pinOffsetX = spiderLeg.param.x;
    const pinOffsetY = spiderLeg.param.y;

    const offsetVariant = (offset: any, variantX: any, variantY: any) => {
      return [offset[0] + (variantX || 0), offset[1] + (variantY || 0)];
    };

    offset = offset ?? 0;
    return {
      top: offsetVariant([0, offset], pinOffsetX, pinOffsetY),
      "top-left": offsetVariant([offset, offset], pinOffsetX, pinOffsetY),
      "top-right": offsetVariant([-offset, offset], pinOffsetX, pinOffsetY),
      bottom: offsetVariant([0, -offset], pinOffsetX, pinOffsetY),
      "bottom-left": offsetVariant([offset, -offset], pinOffsetX, pinOffsetY),
      "bottom-right": offsetVariant([-offset, -offset], pinOffsetX, pinOffsetY),
      left: offsetVariant([offset, -offset], pinOffsetX, pinOffsetY),
      right: offsetVariant([-offset, -offset], pinOffsetX, pinOffsetY),
    };
  }
}

export default MapCustomSpiderfier;
