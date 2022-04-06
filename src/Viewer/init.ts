import initCamera from './camera/initCamera';
import initRenderer from './renderer/initRenderer';
import initScene from './scene/initScene';

export default function init(elementId: string) {
  const renderer = initRenderer(elementId);
  const {camera, controls} = initCamera(renderer);

  const {scene} = initScene(renderer);

  return {renderer, scene, camera, controls};
}
