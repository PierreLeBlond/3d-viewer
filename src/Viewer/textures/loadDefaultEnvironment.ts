import {Mesh, Scene, WebGLRenderer} from 'three';
import Material from '../materials/Material/Material';
import environmentPath from './assets/room.exr';
import loadExrTexture from './loadExrTexture';
import setEnvironmentToScene from './setEnvironmentToScene';

export default async function loadDefaultEnvironment(
    scene: Scene, renderer: WebGLRenderer) {
  const envMap = await loadExrTexture(renderer, environmentPath);
  setEnvironmentToScene(envMap, scene);
}
