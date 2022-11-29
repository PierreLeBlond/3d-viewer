import { Color, LinearEncoding, NoToneMapping, WebGLRenderer } from 'three';

export default function initRenderer(element: HTMLElement): WebGLRenderer {
  const renderer = new WebGLRenderer(
    { antialias: true, alpha: true, preserveDrawingBuffer: true });


  renderer.setSize(element.clientWidth, element.clientHeight);
  renderer.setClearColor(new Color(255, 255, 255), 0);

  renderer.outputEncoding = LinearEncoding;
  renderer.toneMapping = NoToneMapping;

  // turn on the physically correct lighting model
  renderer.physicallyCorrectLights = true;

  renderer.clearColor();

  element.appendChild(renderer.domElement);

  return renderer;
}
