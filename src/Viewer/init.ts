import initCamera from './camera/initCamera';
import initRenderer from './renderer/initRenderer';
import initScene from './scene/initScene';

export default function init(element: HTMLElement) {
  const renderer = initRenderer(element);
  const { camera, controls } = initCamera(renderer);

  const { scene } = initScene();

  return { renderer, scene, camera, controls };
}
