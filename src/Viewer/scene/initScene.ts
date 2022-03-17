import {Scene, WebGLRenderer} from 'three';

export default async function initScene(renderer: WebGLRenderer) {
  const scene = new Scene();
  return {scene};
}
