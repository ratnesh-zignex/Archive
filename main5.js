import { Vector as VectorSource } from "ol/source";
import { Vector as VectorLayer } from "ol/layer";
import WebGLPointsLayerRenderer from "ol/renderer/webgl/PointsLayer";
import { ShaderBuilder } from "ol/webgl/ShaderBuilder";
import Feature from "ol/Feature";
import Point from "ol/geom/Point";
import Map from "ol/Map";
import View from "ol/View";

class CustomWebGLRenderer extends WebGLPointsLayerRenderer {
  constructor(layer) {
    const shaderBuilder = new ShaderBuilder();

    // Define attributes
    shaderBuilder.addAttribute("vec2", "a_position");
    shaderBuilder.addAttribute("float", "a_size");
    shaderBuilder.addAttribute("float", "a_index");
    shaderBuilder.addVarying("vec4", "v_color");

    // Set symbol size and color expressions
    shaderBuilder.setSymbolSizeExpression("vec2(10.0, 10.0)"); // Example size
    shaderBuilder.setSymbolColorExpression("vec4(0.0, 0.5, 1.0, 1.0)"); // Example color

    // Define vertex shader
    shaderBuilder.addVertexShaderFunction(`
      attribute vec2 a_position;
      attribute float a_size;
      attribute float a_index;

      varying float v_index;

      void main() {
        vec2 offset = vec2(
          (a_index == 0.0 || a_index == 3.0) ? -0.5 : 0.5,
          (a_index == 0.0 || a_index == 1.0) ? -0.5 : 0.5
        );
        gl_Position = vec4(a_position + offset * a_size, 0.0, 1.0);
      }
    `);

    // Define fragment shader
    shaderBuilder.addFragmentShaderFunction(`
      precision mediump float;
    varying float v_index; // Receive index from vertex shader
      void main(void) {
      vec4 color = vec4(0.0, 0.5, 1.0, 1.0); // Default color
        if (v_index == 0.0) {
          color = vec4(1.0, 0.0, 0.0, 1.0); // Red for the first point
        } else {
          color = vec4(0.0, 1.0, 0.0, 1.0); // Green for the second point
        }
      gl_FragColor = color;
      }
    `);

    // Log the generated shaders for debugging
    console.log(shaderBuilder.getSymbolVertexShader());
    console.log(shaderBuilder.getSymbolFragmentShader());

    // Pass the shader builder to the parent class
    super(layer, { shaderBuilder });
  }
}

class CustomWebGLLayer extends VectorLayer {
  createRenderer() {
    return new CustomWebGLRenderer(this);
  }
}

// Define data source and add point features
const source = new VectorSource();
source.addFeature(new Feature(new Point([0, 0]))); // First point
source.addFeature(new Feature(new Point([0, 0]))); // Second point

// Create the custom WebGL layer
const layer = new CustomWebGLLayer({ source });

// Create the map
const map = new Map({
  target: "map",
  layers: [layer],
  view: new View({
    center: [0, 0],
    zoom: 4,
  }),
});

// Distinguish the two points visually
// You can set different properties on the features to distinguish them
const features = source.getFeatures();
features[0].setProperties({ a_index: 0 }); // First point
features[1].setProperties({ a_index: 1 }); // Second point
