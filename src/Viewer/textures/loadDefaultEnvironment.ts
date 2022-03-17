import {Mesh, Scene, WebGLRenderer} from 'three';
import Material from '../materials/Material/Material';
import environmentPath from './assets/room.exr';
import loadEnvTexture from './loadEnvTexture';

export default async function loadDefaultEnvironment(
    scene: Scene, renderer: WebGLRenderer) {
  const envMap = await loadEnvTexture(renderer, environmentPath);
  scene.environment = envMap;

  scene.traverse((object: Mesh) => {
    const material = object.material as Material;
    if (material?.isMeshPhysicalMaterial) {
      material.envMap = envMap;
    }
  });
}
