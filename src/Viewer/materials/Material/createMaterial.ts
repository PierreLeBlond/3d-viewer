import {Scene} from 'three/src/scenes/Scene';
import Material from './Material';

export default function createMaterial(scene: Scene) {
  const material = Material.create(scene);
  material.ibl = scene.userData.ibl;
  return material;
}
