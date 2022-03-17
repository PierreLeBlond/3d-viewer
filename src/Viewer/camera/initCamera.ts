import {PerspectiveCamera, WebGLRenderer} from 'three';
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls';

export default function initCamera(renderer: WebGLRenderer) {
  const camera = new PerspectiveCamera(
      75, window.innerWidth / window.innerHeight, 0.1, 100);

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.enablePan = false;
  controls.minDistance = 1;
  controls.maxDistance = 100;
  controls.maxPolarAngle = 1.5;

  camera.position.set(0, 1, 5);
  controls.update();

  return {camera, controls};
}
