import { TextureLoader } from 'three/src/loaders/TextureLoader';

export default async function loadTexture(path: string) {
  const loader = new TextureLoader();
  loader.withCredentials = true;
  loader.crossOrigin = 'use-credentials';
  const texture = await loader.loadAsync(path);
  return texture;
};
