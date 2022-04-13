import {Scene, Texture, WebGLRenderer} from 'three';
import loadHdrTexture from './textures/loadHdrTexture';
import setEnvironmentToScene from './textures/setEnvironmentToScene';

export default async function loadEnvironment(
    renderer: WebGLRenderer, scene: Scene, url: string): Promise<void> {
  const environment = await loadHdrTexture(renderer, url);
  setEnvironmentToScene(environment, scene);
}
