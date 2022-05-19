import {NearestFilter, NearestMipmapNearestFilter} from 'three';
import {DDSLoader} from 'three/examples/jsm/loaders/DDSLoader';
import {Texture} from 'three/src/textures/Texture';

export default async function loadDdsTexture(path: string): Promise<Texture> {
  const loader = new DDSLoader();
  const texture = await loader.loadAsync(path);
  texture.minFilter = NearestMipmapNearestFilter;
  texture.magFilter = NearestFilter;
  return texture;
}
