import WebGLPointsLayer from "ol/layer/WebGLPoints.js";
import WebGLPointsLayerRenderer from "ol/renderer/webgl/PointsLayer.js";

export class CustomWebGLPointsLayer extends WebGLPointsLayer {
    constructor(options) {
        super(options);
        console.log(options, "options");
    }
  createRenderer() {
    return new WebGLPointsLayerRenderer(this, {
      attributes: [
        {
          name: "offsetX",
          callback: (feature) => feature.get("spiderfyOffset")?.[0] || 0,
        },
        {
          name: "offsetY",
          callback: (feature) => {
            // console.log(feature, "offsetY");
            return feature.get("spiderfyOffset")?.[1] || 0;
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
  `
    });
  }
}
// import WebGLPointsLayer from "ol/layer/WebGLPoints.js";
// import WebGLPointsLayerRenderer from "ol/renderer/webgl/PointsLayer.js";

// export class CustomWebGLPointsLayer extends WebGLPointsLayer {
//   createRenderer() {
//     return new WebGLPointsLayerRenderer(this, {
//       attributes: [
//         { name: "a_offsetX", callback: (f) => f.get("offsetX") || 0 },
//         { name: "a_offsetY", callback: (f) => f.get("offsetY") || 0 },
//       ],
//       uniforms: {
//         u_size: 10.0,
//         u_color: [0.0, 1.0, 0.0, 1.0],
//       },
//       vertexShader: `
//         attribute vec2 a_position;
//         attribute float a_offsetX;
//         attribute float a_offsetY;
//         uniform float u_size;
//         void main() {
//           gl_PointSize = u_size;
//           gl_Position = vec4(a_position + vec2(a_offsetX, a_offsetY), 0.0, 1.0);
//         }
//       `,
//       fragmentShader: `
//         precision mediump float;
//         uniform vec4 u_color;
//         void main() {
//           gl_FragColor = u_color;
//         }
//       `,
//     });
//   }
// }