import {Scene} from 'three/src/scenes/Scene';
import Material from './Material';

export default function createMaterial(scene: Scene) {
  const material = Material.create();
  material.envMap = scene.environment;
  return material;
}
