import { LinearFilter, LinearMipmapLinearFilter, LinearSRGBColorSpace } from 'three';
import { DDSLoader } from 'three/examples/jsm/loaders/DDSLoader';
import type { Texture } from 'three/src/textures/Texture';

export default async function loadDdsTexture(path: string): Promise<Texture> {
  const loader = new DDSLoader();
  const texture = await loader.loadAsync(path);
  texture.minFilter = LinearMipmapLinearFilter;
  texture.magFilter = LinearFilter;
  texture.colorSpace = LinearSRGBColorSpace;

  return texture;
}
