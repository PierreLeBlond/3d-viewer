import {TextureLoader} from 'three/src/loaders/TextureLoader';

export default async function loadTexture(path: string) {
  const loader = new TextureLoader();
  const texture = await loader.loadAsync(path);
  return texture;
};
