import {Mesh, Scene, Texture} from 'three';
import Material from '../materials/Material/Material';

export default function setEnvironmentToScene(
    environment: Texture, scene: Scene) {
  scene.environment = environment;
  scene.environment.userData.viewSpace = scene.userData.viewSpaceEnvironment;
  scene.traverse((object: Mesh) => {
    const material = object.material as Material;
    if (material?.isMeshPhysicalMaterial) {
      material.envMap = environment;
    }
  });
}
