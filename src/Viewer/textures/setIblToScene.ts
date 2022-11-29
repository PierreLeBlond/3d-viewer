import type { Mesh, Object3D, Scene } from 'three';
import type Material from '../materials/Material/Material';
import type Ibl from './Ibl';

export default function setIblToScene(ibl: Ibl, scene: Scene) {
  scene.userData['ibl'] = ibl;
  scene.traverse((object: Object3D) => {
    if (object.type != 'Mesh') {
      return;
    }
    const material = (object as Mesh).material as Material;
    if (material?.isMeshPhysicalMaterial) {
      material.ibl = ibl;
    }
  });
}
