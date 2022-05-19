import {TextureLoader} from 'three/src/loaders/TextureLoader';

export default async function loadTexture(path: string) {
  const loader = new TextureLoader();
  const envMap = await loader.loadAsync(path);
  return envMap;
};
