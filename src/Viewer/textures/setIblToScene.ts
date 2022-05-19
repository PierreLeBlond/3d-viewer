import {Mesh, Scene, Texture} from 'three';
import Material from '../materials/Material/Material';
import Ibl from './Ibl';

export default function setIblToScene(ibl: Ibl, scene: Scene) {
  scene.userData.ibl = ibl;
  scene.traverse((object: Mesh) => {
    const material = object.material as Material;
    if (material?.isMeshPhysicalMaterial) {
      material.ibl = ibl;
    }
  });
}
