import {PMREMGenerator, TextureLoader, WebGLRenderer} from 'three';
import {EXRLoader} from 'three/examples/jsm/loaders/EXRLoader';
import {Texture} from 'three/src/textures/Texture';
import getPMREMEnvMap from './getPMREMEnvMap';
import loadRgbeTexture from './loadRgbeTexture';

export default async function loadHdrTexture(
    renderer: WebGLRenderer, path: string): Promise<Texture> {
  const texture = await loadRgbeTexture(renderer, path);
  const envMap = getPMREMEnvMap(renderer, texture);
  return envMap;
}
