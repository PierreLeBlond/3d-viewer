import { Color, MeshBasicMaterial, type Object3D } from "three";
import type Viewer from "../../Viewer";
import { getDisolveData } from "./getDisolveData";

const DELAY = 1;
const DURATION = 3;
const COLOR = new Color(0x00ff00);

export interface DisolveObjectOptions {
  delay?: number;
  duration?: number;
  color?: string | number;
}

export const disolveObject = async (
  viewer: Viewer,
  object: Object3D,
  options: DisolveObjectOptions
) => {
  const { scene } = viewer;

  if (!scene) {
    throw new Error("Viewer must have a scene");
  }

  const delay = options.delay ?? DELAY;
  const duration = options.duration ?? DURATION;
  const color = options.color ? new Color(options.color) : COLOR;

  const meshDatas = getDisolveData(object);

  let time = 0;

  return new Promise<void>((resolve) => {
    const addDisolveStep = (event: { delta: number }) => {
      time += event["delta"];
      const wireframeScale = Math.min(1, time / duration);
      const hiddenScale = Math.max(0, (time - delay) / duration);

      meshDatas.forEach(({ mesh, wireframeMesh, faceCount }) => {
        const faceIndex = Math.trunc(wireframeScale * faceCount);
        const hiddenFaceIndex = Math.trunc(hiddenScale * faceCount);
        mesh.geometry.setDrawRange(faceIndex * 3, (faceCount - faceIndex) * 3);
        wireframeMesh.geometry.setDrawRange(
          hiddenFaceIndex * 3,
          (faceIndex - hiddenFaceIndex) * 3
        );
      });

      if (time > delay + duration) {
        meshDatas.forEach(({ mesh, wireframeMesh }) => {
          wireframeMesh.visible = false;
          mesh.visible = false;
        });
        scene
          .getEventDispatcher()
          .removeEventListener("animate", addDisolveStep);
        resolve();
      }
    };

    scene.getEventDispatcher().addEventListener("animate", addDisolveStep);

    meshDatas.forEach(({ mesh, wireframeMesh }) => {
      wireframeMesh.visible = true;
      const material = wireframeMesh.material as MeshBasicMaterial;
      material.color = color;
      mesh.visible = true;
    });

    object.visible = true;
  });
};
