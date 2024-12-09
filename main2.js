import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import Layer from 'ol/layer/Layer';
import WebGLPointsLayerRenderer from 'ol/renderer/webgl/PointsLayer';
import {fromLonLat} from 'ol/proj';
import VectorSource from 'ol/source/Vector';
import Feature from 'ol/Feature';
import Point from 'ol/geom/Point';
import {OSM} from 'ol/source';

// Custom WebGLPointsLayerRenderer subclass
class CustomWebGLLayer extends Layer {
  constructor(layer) {
    super(layer);
    console.log(layer);
  } 
  prepareFrame(frameState) {
    console.log(frameState);
    
    const gl = frameState.context; // Access the WebGL context from the frameState

    // Check shader compilation
    this.checkShaderCompile(gl);
    console.log(gl);
    
    // Your rendering logic goes here...

    return super.prepareFrame(frameState);
  }
  checkShaderCompile(gl) {
    const shader = gl.createShader(gl.VERTEX_SHADER);
    const vertexShaderSource = `
      precision mediump float;
      attribute vec2 a_position;
      void main() {
        gl_Position = vec4(a_position, 0.0, 1.0);
      }
    ;
    gl.shaderSource(shader, vertexShaderSource);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      console.error(
        'Vertex shader compile failed:',
        gl.getShaderInfoLog(shader),
      );
    }`
  };
  createRenderer() {
    return new WebGLPointsLayerRenderer(this, {
      style: webglPointLyrStyle,
      attributes: [
        {
          name: 'size',
          callback: (feature) => feature.get('size') || 10,
        },
        {
          name: 'color',
          callback: (feature) => feature.get('color') || [1, 0, 0, 1],
        },
        {
          name: 'angle',
          callback: (feature) => feature.get('angle') || 0,
        },
        {
          name: 'position',
          callback: (feature) => {
            console.log(feature);

            return feature.getGeometry().getCoordinates();
          },
        },
      ],
      // Custom vertex shader for star shape
      vertexShader: `
        precision mediump float;
        
        uniform mat4 u_projectionMatrix;
        uniform mat4 u_offsetScaleMatrix;
        uniform mat4 u_offsetRotateMatrix;
        
        attribute vec2 a_position;
        attribute float a_size;
        attribute vec4 a_color;
        attribute float a_angle;
        
        varying vec4 v_color;
        varying vec2 v_texCoord;
        varying float v_size;
        
        void main() {
          mat4 offsetMatrix = u_offsetScaleMatrix * u_offsetRotateMatrix;
          vec4 offsets = offsetMatrix * vec4(a_position, 0.0, 1.0);
          gl_Position = u_projectionMatrix * vec4(offsets.xy, 0.0, 1.0);
          
          v_texCoord = a_position;
          v_color = a_color;
          v_size = a_size;
          
          gl_PointSize = a_size;
        }`
      ,
      // Custom fragment shader for star shape
      fragmentShader: `
        precision mediump float;
        
        varying vec4 v_color;
        varying vec2 v_texCoord;
        varying float v_size;
        
        void main() {
          vec2 center = vec2(0.5, 0.5);
          vec2 point = gl_PointCoord;
          
          // Create a custom star shape
          float radius = 0.5;
          float angle = atan(point.y - center.y, point.x - center.x);
          float length = length(point - center);
          
          // 5-pointed star
          float starRadius = radius * (0.5 + 0.5 * cos(angle * 5.0));
          
          if (length > starRadius) {
            discard;
          }
          
          gl_FragColor = v_color;
        }`
      ,
    });
  }
}

// Features with attributes
const vectorSource = new VectorSource();
vectorSource.addFeatures([
  new Feature({
    geometry: new Point(fromLonLat([0, 0])),
    size: 15,
    color: [0, 1, 0, 1], // Green RGBA
    angle: 0
  }),
  new Feature({
    geometry: new Point(fromLonLat([1, 1])),
    size: 20,
    color: [0, 0, 1, 1], // Blue RGBA
    angle: 0
  }),
]);

const webglPointLyrStyle = {
  "circle-radius": 7,
  "circle-fill-color": "#33AAFF",
  "circle-rotate-with-view": false,
  "circle-displacement": [0, 0],
};
// Add vector source features to a standard layer for interaction
const customLayer = new CustomWebGLLayer({
  source: vectorSource, // Ensure vector source is used appropriately,
  style: webglPointLyrStyle,
});

const osmLayer = new TileLayer({
  source: new OSM(),
});

// Create and display the map
const map = new Map({
  target: 'map',
  layers: [osmLayer, customLayer],
  view: new View({
    center: fromLonLat([0, 0]),
    zoom: 2,
  }),
});
console.log(map.getLayers().getArray());
