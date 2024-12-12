import Map from "ol/Map";
import View from "ol/View";
import { Vector as VectorSource } from "ol/source";
import { Vector as VectorLayer } from "ol/layer";
import WebGLPointsLayer from "ol/layer/WebGLPoints";
import Feature from "ol/Feature";
import Point from "ol/geom/Point";
import { ShaderBuilder } from "ol/webgl/ShaderBuilder";

// Custom WebGL Points Layer
class CustomWebGLRenderer extends WebGLPointsLayer {
  constructor(layer) {
    const shaderBuilder = new ShaderBuilder();

    // Define attributes
    shaderBuilder.addAttribute("vec2", "a_position");
    shaderBuilder.addAttribute("float", "a_offset"); // Use for offsetting points

    // Define varying (passed from vertex to fragment shader)
    shaderBuilder.addVarying("vec4", "v_color");

    // Add uniform (global values passed to shaders)
    shaderBuilder.addUniform("vec2", "u_viewportSizePx");

    // Vertex Shader
    shaderBuilder.addVertexShaderFunction(`
      attribute vec2 a_position;
      attribute float a_offset;
      uniform vec2 u_viewportSizePx;

      varying vec4 v_color;

      void main() {
        // Offset the position to distinguish overlapping points
        vec2 offset = vec2(a_offset, a_offset) / u_viewportSizePx;
        vec2 finalPosition = a_position + offset;

        // Pass color to fragment shader
        v_color = vec4(0.0, 0.5 + a_offset * 0.5, 1.0 - a_offset * 0.5, 1.0);

        // Convert to clipspace
        gl_Position = vec4(2.0 * finalPosition.x - 1.0, 1.0 - 2.0 * finalPosition.y, 0.0, 1.0);
      }
    `);

    // Fragment Shader
    shaderBuilder.addFragmentShaderFunction(`
      precision mediump float;

      varying vec4 v_color;

      void main() {
        // Set the fragment color
        gl_FragColor = v_color;
      }
    `);

    // Pass the shader builder to the parent class
    super(layer, { shaderBuilder });
  }
}

class CustomWebGLLayer extends VectorLayer {
  createRenderer() {
    return new CustomWebGLRenderer(this);
  }
}

// Define data source with overlapping points
const source = new VectorSource();
source.addFeature(new Feature({ geometry: new Point([0, 0]), a_offset: 0.0 })); // Point 1
source.addFeature(new Feature({ geometry: new Point([0, 0]), a_offset: 0.1 })); // Point 2

// Create custom WebGL layer with default style object
const layer = new CustomWebGLLayer({
  source,
  style: {
    "circle-radius": 7,
    "circle-fill-color": "#33AAFF",
    "circle-rotate-with-view": false,
    "circle-displacement": [0, 0],
  },
});

const map = new Map({
  target: "map",
  layers: [layer],
  view: new View({
    center: [0, 0],
    zoom: 4,
  }),
});
