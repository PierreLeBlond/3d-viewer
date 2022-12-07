import initCamera from './camera/initCamera';
import initRenderer from './renderer/initRenderer';

export default function init(element: HTMLElement) {
  const renderer = initRenderer(element);
  const { camera, controls } = initCamera(renderer);

  return { renderer, camera, controls };
}
