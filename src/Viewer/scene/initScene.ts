import { WebGLRenderer } from "three/src/renderers/WebGLRenderer";
import { Scene } from "three/src/scenes/Scene";
import { sRGBEncoding } from "three/src/constants";

export default async function initScene(renderer: WebGLRenderer) {
  const scene = new Scene();
  return { scene };
}
