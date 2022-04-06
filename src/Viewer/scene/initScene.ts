import {Scene, WebGLRenderer} from 'three';

export default function initScene(renderer: WebGLRenderer) {
  const scene = new Scene();
  return {scene};
}
