import { WebGLRenderer } from "three/src/renderers/WebGLRenderer";
import loadEnvTexture from "../textures/env/loadEnvTexture";
import environmentPath from "./environment/room.exr";
import { Scene } from "three/src/scenes/Scene";
import { sRGBEncoding } from "three/src/constants";

export default async function initScene(renderer: WebGLRenderer) {
  const scene = new Scene();

  const envMap = await loadEnvTexture(renderer, environmentPath);

  scene.environment = envMap;

  return { scene };
}
