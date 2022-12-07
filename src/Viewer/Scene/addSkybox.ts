import { SphereGeometry } from 'three/src/geometries/SphereGeometry';
import { Mesh } from 'three/src/objects/Mesh';
import type { Scene } from 'three/src/scenes/Scene';
import createSkyboxMaterial from '../materials/Material/createSkyboxMaterial';

export default function addSkybox(scene: Scene) {
  const material = createSkyboxMaterial(scene);
  const geometry = new SphereGeometry(1, 32, 32);

  const mesh = new Mesh(geometry, material);

  scene.add(mesh);
}
