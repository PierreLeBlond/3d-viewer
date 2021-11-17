import initRenderer from "./renderer/initRenderer";
import initScene from "./scene/initScene";
import initCamera from "./camera/initCamera";

export default async function init(elementId: string) {
  const renderer = initRenderer(elementId);
  const { camera, controls } = initCamera(renderer);

  const { scene } = await initScene(renderer);

  return { renderer, scene, camera, controls };
}
