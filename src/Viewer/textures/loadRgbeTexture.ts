import {EquirectangularReflectionMapping, WebGLRenderer} from 'three';
import {RGBELoader} from 'three/examples/jsm/loaders/RGBELoader';

export default async function loadRgbeTexture(
    renderer: WebGLRenderer, path: string) {
  const loader = new RGBELoader();
  loader.crossOrigin = 'anonymous';
  const texture = await loader.loadAsync(path);

  texture.mapping = EquirectangularReflectionMapping;

  return texture;
}
