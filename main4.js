import Map from "ol/Map";
import View from "ol/View";
import { fromLonLat } from "ol/proj";
import VectorSource from "ol/source/Vector";
import Feature from "ol/Feature";
import { Point } from "ol/geom";
import TileLayer from "ol/layer/Tile";
import OSM from "ol/source/OSM";
import WebGLPointsLayer from "ol/layer/WebGLPoints";

// Base map layer
const baseLayer = new TileLayer({
  source: new OSM(),
});

// Create features
const features = [
  new Feature({
    geometry: new Point(fromLonLat([-0.1276, 51.5074])), // London
    spiderfyOffset: [10, 20],
    size: 20,
  }),
  new Feature({
    geometry: new Point(fromLonLat([2.3522, 48.8566])), // Paris
    spiderfyOffset: [-15, -25],
    size: 30,
  }),
];

// Create a vector source
const source = new VectorSource({
  features,
});
const webglPointLyrStyle = {
  "circle-radius": 7,
  "circle-fill-color": "#33AAFF",
  "circle-rotate-with-view": false,
  "circle-displacement": [0, 0],
};
// Custom WebGL Points Layer
const webglLayer = new WebGLPointsLayer({
  source: source,
  style: webglPointLyrStyle
});

// Create the map
const map = new Map({
  target: "map",
  layers: [baseLayer, webglLayer],
  view: new View({
    center: fromLonLat([0, 50]), // Centered between London and Paris
    zoom: 4,
  }),
});


// Function to update a feature dynamically
function updateFeature(feature, newOffset, newSize) {
  feature.set("spiderfyOffset", newOffset);
  feature.set("size", newSize);
  source.changed(); // Refresh the source to update the layer
}

// Example: Update the first feature (London) after 3 seconds
setTimeout(() => {
  const londonFeature = features[0];
  updateFeature(londonFeature, [50, 50], 40); // New offset and size
}, 3000);
