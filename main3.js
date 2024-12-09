import Feature from 'ol/Feature.js';
import Map from 'ol/Map.js';
import Point from 'ol/geom/Point.js';
import View from 'ol/View.js';
import {Circle as CircleStyle, Fill, Stroke, Style, Text} from 'ol/style.js';
import {Cluster, OSM, Vector as VectorSource} from 'ol/source.js';
import {Tile as TileLayer, Vector as VectorLayer} from 'ol/layer.js';
import {boundingExtent} from 'ol/extent.js';
import WebGLPointsLayer from 'ol/layer/WebGLPoints.js';

const distanceInput = document.getElementById('distance');
const minDistanceInput = document.getElementById('min-distance');

const count = 20000;
const features = new Array(count);
const e = 4500000;
for (let i = 0; i < count; ++i) {
  const coordinates = [2 * e * Math.random() - e, 2 * e * Math.random() - e];
  features[i] = new Feature(new Point(coordinates));
}

const source = new VectorSource({
  features: features,
});

const clusterSource = new Cluster({
  distance: parseInt(distanceInput.value, 10),
  minDistance: parseInt(minDistanceInput.value, 10),
  source: source,
});

const styleCache = {};
const clusters = new VectorLayer({
  source: clusterSource,
  style: function (feature) {
    const size = feature.get('features').length;
    let style = styleCache[size];
    if (!style) {
      style = new Style({
        image: new CircleStyle({
          radius: 10,
          stroke: new Stroke({
            color: '#fff',
          }),
          fill: new Fill({
            color: '#3399CC',
          }),
        }),
        text: new Text({
          text: size.toString(),
          fill: new Fill({
            color: '#fff',
          }),
        }),
      });
      styleCache[size] = style;
    }
    return style;
  },
});

const raster = new TileLayer({
  source: new OSM(),
});
const webglPointLyrStyle = {
  'circle-radius': 7,
  'circle-fill-color': '#33AAFF',
  'circle-rotate-with-view': false,
  'circle-displacement': [0, 0],
};
// const webgl = new WebGLPointsLayer({
//   source: clusterSource,
//   style: webglPointLyrStyle,
// });
const webgl = new WebGLPointsLayer({
  source: clusterSource,
  style: webglPointLyrStyle,
  // hitDetectionEnabled: true,
  attributes: [
    {
      name: 'offsetX',
      callback: (feature) => feature.get('spiderfyOffset')?.[0] || 0,
    },
    {
      name: 'offsetY',
      callback: (feature) => {
        console.log(feature.get('spiderfyOffset')?.[1], 'offsetY');
        return feature.get('spiderfyOffset')?.[1] || 0;
      },
    },
  ],
  vertexShader: `
    attribute vec2 a_position;
    attribute float a_offsetX;
    attribute float a_offsetY;
    void main() {
      vec2 offsetPosition = a_position + vec2(a_offsetX, a_offsetY);
      gl_Position = vec4(offsetPosition, 0.0, 1.0);
    }
  `,
  fragmentShader: `
    precision mediump float;
    void main() {
      gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0); // Red color
    }
  `,
});
const map = new Map({
  layers: [raster, webgl],
  target: 'map',
  view: new View({
    center: [0, 0],
    zoom: 2,
  }),
});

distanceInput.addEventListener('input', function () {
  clusterSource.setDistance(parseInt(distanceInput.value, 10));
});

minDistanceInput.addEventListener('input', function () {
  clusterSource.setMinDistance(parseInt(minDistanceInput.value, 10));
});

map.on('click', (e) => {
  clusters.getFeatures(e.pixel).then((clickedFeatures) => {
    if (clickedFeatures.length) {
      // Get clustered Coordinates
      const features = clickedFeatures[0].get('features');
      if (features.length > 1) {
        const extent = boundingExtent(
          features.map((r) => r.getGeometry().getCoordinates()),
        );
        map.getView().fit(extent, {duration: 1000, padding: [50, 50, 50, 50]});
      }
    }
  });
});
