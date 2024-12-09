import "ol/ol.css";
import Map from "ol/Map";
import View from "ol/View";

import { Cluster, OSM } from "ol/source";
import VectorSource from "ol/source/Vector";
import { Point } from "ol/geom";
import Feature from "ol/Feature";
import TileLayer from "ol/layer/Tile";
import { CustomWebGLPointsLayer } from "./CustomWebGLPointsLayer";
// Sample overlapping points
const createFeatures = () => {
  const features = [];
  const radius = 0.0001;
  const center = [0, 0]; // Overlapping at the same coordinate
  const angleStep = (2 * Math.PI) / 10;
  for (let i = 0; i < 10; i++) {
    const angle = i * angleStep;
    features.push(
      new Feature(new Point(center) )
    );
   features[i].set("spiderfyOffset", [
     radius * Math.cos(angle),
     radius * Math.sin(angle),
   ]);
  }
  console.log(features, "features");
  
  return features;
};

// Cluster source
const vectorSource = new VectorSource({
  features: createFeatures(),
});

const clusterSource = new Cluster({
  source: vectorSource,
  distance: 10, // Group features within 50 pixels
});

// Spiderfying Logic
const spiderfy = (clusterFeature, radius = 0.0001) => {
  const originalFeatures = clusterFeature.get("features");
  const count = originalFeatures.length;

  if (count > 1) {
    const angleStep = (2 * Math.PI) / count;
    originalFeatures.forEach((feature, i) => {
      const angle = i * angleStep;
      feature.set("spiderfyOffset", [
        radius * Math.cos(angle),
        radius * Math.sin(angle),
      ]);
      feature.set("size", 20);
      // console.log(feature.get("spiderfyOffset"), "spiderfyOffset");
      
    });
  }
};

const webglPointLyrStyle = {
  // "circle-radius": 7,
  // "circle-fill-color": "#33AAFF",
  // "circle-rotate-with-view": false,
  // "circle-displacement": [0, 0],
};

// GLrenderer = new WebGLPointsLayerRenderer(pointsLayer);

// WebGLPointsLayer with dynamic offsets
const pointsLayer = new CustomWebGLPointsLayer({
  source: vectorSource,
  style: {},
  // hitDetectionEnabled: true,
  // attributes: [
  //   {
  //     name: "offsetX",
  //     callback: (feature) => feature.get("spiderfyOffset")?.[0] || 0,
  //   },
  //   {
  //     name: "offsetY",
  //     callback: (feature) => {
  //       // console.log(feature, "offsetY");
  //       return feature.get("spiderfyOffset")?.[1] || 0;
  //     },
  //   },
  // ],
  // vertexShader: `
  //   attribute vec2 a_position;
  //   attribute float a_offsetX;
  //   attribute float a_offsetY;
  //   void main() {
  //     vec2 offsetPosition = a_position + vec2(a_offsetX, a_offsetY);
  //     gl_Position = vec4(offsetPosition, 0.0, 1.0);
  //   }
  // `,
  // fragmentShader: `
  // //   precision mediump float;
  // //   void main() {
  // //     gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0); // Red color
  // //   }
  // `,
});

// Map
const map = new Map({
  target: "map",
  layers: [
    new TileLayer({source:new OSM}) ,
    pointsLayer],
  view: new View({
    center: [0, 0],
    zoom: 5,
  }),
});

// // Interaction: Spiderfying on click
// clusterSource.on("error", (event) => {
//   console.log("Layer changed", event);
// });

// Interaction: Spiderfying on click
// clusterSource.on("changefeature", (event) => {
//   console.log("Layer changed", event);
// });
map.on("singleclick", (event) => {
  map.forEachFeatureAtPixel(event.pixel, (feature) => {
    if (feature.get("features").length > 1) {

      console.log("Spiderfying", feature.get("features").length, "features");

      // Apply spiderfy and update offsets
      spiderfy(feature);

      // Force the layer to re-render
      pointsLayer.changed(); // This triggers a re-render of the WebGL layer
      clusterSource.refresh(); // Ensure clusters are recalculated
      pointsLayer.changed(); // Force the WebGL layer to re-render
    }
  });
});
