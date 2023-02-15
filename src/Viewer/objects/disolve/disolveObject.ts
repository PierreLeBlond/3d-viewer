import type { Object3D } from "three";
import type Viewer from "../../Viewer";
import { getDisolveData } from "./getDisolveData";

const DELAY = 1;
const DURATION = 3;

export interface DisolveObjectOptions {
  delay?: number,
  duration?: number
};

export const disolveObject = async (viewer: Viewer, object: Object3D, options: DisolveObjectOptions) => {

  const { scene } = viewer;

  if (!scene) {
    throw new Error('Viewer must have a scene');
  }

  const delay = options.delay ?? DELAY;
  const duration = options.duration ?? DURATION;

  const meshDatas = getDisolveData(object);

  let time = 0;

  return new Promise<void>((resolve) => {
    const addDisolveStep = (event: { [x: string]: number; }) => {
      time += event['delta'] as number;
      const wireframeScale = Math.min(1, time / duration);
      const hiddenScale = Math.max(0, (time - delay) / duration);

      meshDatas.forEach(({ mesh, wireframeMesh, faceCount }) => {
        const faceIndex = Math.trunc(wireframeScale * faceCount);
        const hiddenFaceIndex = Math.trunc(hiddenScale * faceCount);
        mesh.geometry.setDrawRange(faceIndex * 3, (faceCount - faceIndex) * 3);
        wireframeMesh.geometry.setDrawRange(hiddenFaceIndex * 3, (faceIndex - hiddenFaceIndex) * 3);
      })

      if (time > delay + duration) {
        meshDatas.forEach(({ mesh, wireframeMesh }) => {
          wireframeMesh.visible = false;
          mesh.visible = false;
        });
        scene.removeEventListener('animate', addDisolveStep);
        resolve();
      }
    }

    scene.addEventListener('animate', addDisolveStep);

    meshDatas.forEach(({ mesh, wireframeMesh }) => {
      wireframeMesh.visible = true;
      mesh.visible = true;
    });
  });
}