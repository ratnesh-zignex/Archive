import { Vector as VectorSource } from "ol/source";
import { Vector as VectorLayer } from "ol/layer";
import WebGLPointsLayerRenderer from "ol/renderer/webgl/PointsLayer";
import * as _ from "ol/webgl/ShaderBuilder";
import Feature from "ol/Feature";
import Point from "ol/geom/Point";

class CustomWebGLRenderer extends WebGLPointsLayerRenderer {
  constructor(layer) {
    const shaderBuilder = new _.ShaderBuilder();
    // Define vertex attributes
    shaderBuilder.addAttribute("vec2", "a_position");
    shaderBuilder.addAttribute("float", "a_size");
    shaderBuilder.addAttribute("float", "a_index");

    shaderBuilder.addVertexShaderFunction(`
      attribute vec2 a_position;
      attribute float a_size;
      attribute float a_index;

      void main() {
        vec2 offset = vec2(
          (a_index == 0.0 || a_index == 3.0) ? -0.5 : 0.5,
          (a_index == 0.0 || a_index == 1.0) ? -0.5 : 0.5
        );
        gl_Position = vec4(a_position + offset * a_size, 0.0, 1.0);
      }
    `);

    shaderBuilder.addVertexShaderFunction(`
      precision mediump float;

      void main() {
        gl_FragColor = vec4(0.0, 0.5, 1.0, 1.0); // Blue color
      }
    `);

    // Pass the shader builder to the parent class
    super(layer, { shaderBuilder });
  }
}

// Define a custom layer that uses the custom renderer
class CustomWebGLLayer extends VectorLayer {
  createRenderer() {
    return new CustomWebGLRenderer(this);
  }
}

// Define data source and add a point feature
const source = new VectorSource();
source.addFeature(new Feature(new Point([0, 0])));

// Create the custom WebGL layer
const layer = new CustomWebGLLayer({ source });

// Add layer to the map
import Map from "ol/Map";
import View from "ol/View";

const map = new Map({
  target: "map",
  layers: [layer],
  view: new View({
    center: [0, 0],
    zoom: 4,
  }),
});
