import { Color, MeshBasicMaterial, type Object3D } from "three";
import type Viewer from "../../Viewer";
import { getDisolveData } from "./getDisolveData";

const DELAY = 1;
const DURATION = 3;
const COLOR = new Color(0x00ff00);

export interface ResolveObjectOptions {
  delay?: number,
  duration?: number,
  color?: string | number
};

export const resolveObject = async (viewer: Viewer, object: Object3D, options: ResolveObjectOptions) => {

  const { scene } = viewer;

  if (!scene) {
    throw new Error('Viewer must have a scene');
  }

  const delay = options.delay ?? DELAY;
  const duration = options.duration ?? DURATION;
  const color = options.color ? new Color(options.color) : COLOR;

  const meshDatas = getDisolveData(object);

  let time = duration + delay;

  return new Promise<void>((resolve) => {
    const addDisolveStep = (event: { [x: string]: number; }) => {
      time -= event['delta'] as number;
      const wireframeScale = Math.min(1, time / duration);
      const hiddenScale = Math.max(0, (time - delay) / duration);

      meshDatas.forEach(({ mesh, wireframeMesh, faceCount }) => {
        const faceIndex = Math.trunc(wireframeScale * faceCount);
        const hiddenFaceIndex = Math.trunc(hiddenScale * faceCount);
        mesh.geometry.setDrawRange(faceIndex * 3, (faceCount - faceIndex) * 3);
        wireframeMesh.geometry.setDrawRange(hiddenFaceIndex * 3, (faceIndex - hiddenFaceIndex) * 3);
      })

      if (time < 0) {
        meshDatas.forEach(({ wireframeMesh }) => {
          wireframeMesh.visible = false;
        });
        scene.removeEventListener('animate', addDisolveStep);
        resolve();
      }
    }

    scene.addEventListener('animate', addDisolveStep);

    meshDatas.forEach(({ mesh, wireframeMesh }) => {
      wireframeMesh.visible = true;
      const material = wireframeMesh.material as MeshBasicMaterial;
      material.color = color;
      mesh.visible = true;
    });

    object.visible = true;
  });
}