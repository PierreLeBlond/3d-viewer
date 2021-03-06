import {ACESFilmicToneMapping, Color, sRGBEncoding, WebGLRenderer} from 'three';

export default function initRenderer(elementId: string): WebGLRenderer {
  const renderer = new WebGLRenderer({antialias: true, alpha: true});

  const element = document.getElementById(elementId);

  renderer.setSize(element.clientWidth, element.clientHeight);
  renderer.setClearColor(new Color(255, 255, 255), 0);

  renderer.outputEncoding = sRGBEncoding;
  renderer.toneMapping = ACESFilmicToneMapping;

  // turn on the physically correct lighting model
  renderer.physicallyCorrectLights = true;

  renderer.clearColor();

  element.appendChild(renderer.domElement);

  return renderer;
}
