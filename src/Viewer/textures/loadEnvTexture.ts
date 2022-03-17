import {PMREMGenerator, WebGLRenderer} from 'three';
import {EXRLoader} from 'three/examples/jsm/loaders/EXRLoader';
import {Texture} from 'three/src/textures/Texture';

export default async function loadEnvTexture(
    renderer: WebGLRenderer, path: string): Promise<Texture> {
  const exrLoader = new EXRLoader();
  exrLoader.crossOrigin = 'anonymous';
  const texture = await exrLoader.loadAsync(path);
  const pmremGenerator = new PMREMGenerator(renderer);
  pmremGenerator.compileEquirectangularShader();
  const envMap = pmremGenerator.fromEquirectangular(texture).texture;
  texture.dispose();
  pmremGenerator.dispose();
  return envMap;
}
