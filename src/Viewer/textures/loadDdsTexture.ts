import { LinearEncoding, LinearFilter, LinearMipmapLinearFilter } from 'three';
import { DDSLoader } from 'three/examples/jsm/loaders/DDSLoader';
import { Texture } from 'three/src/textures/Texture';

export default async function loadDdsTexture(path: string): Promise<Texture> {
  const loader = new DDSLoader();
  loader.withCredentials = true;
  loader.crossOrigin = 'use-credentials';
  const texture = await loader.loadAsync(path);
  texture.minFilter = LinearMipmapLinearFilter;
  texture.magFilter = LinearFilter;
  texture.encoding = LinearEncoding;

  return texture;
}
