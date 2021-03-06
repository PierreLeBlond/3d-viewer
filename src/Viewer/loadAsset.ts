import {Mesh, MeshPhysicalMaterial, Scene, WebGLRenderer} from 'three';
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader';
import createMaterial from './materials/Material/createMaterial';
import Material from './materials/Material/Material';

export default async function loadAsset(
    renderer: WebGLRenderer, scene: Scene, url: string) {
  const gltfLoader = new GLTFLoader();

  const baseUrl = url.match(/(?<base>.+\/)(?:\w|\.)+/).groups.base;
  gltfLoader.resourcePath = baseUrl;

  const asset = await gltfLoader.loadAsync(url);
  asset.scene.name = 'main';
  scene.add(asset.scene);

  // dispatch animations
  asset.animations.forEach(animation => {
    const name = animation.name.split('|')[0];
    const object = scene.getObjectByName(name);
    if (object) {
      object.animations.push(animation);
    } else {
      scene.animations.push(animation);
    }
  });

  // fix imported textures
  scene.traverse((object: Mesh) => {
    const physicalMaterial = object.material as MeshPhysicalMaterial;

    if (physicalMaterial) {
      const material = createMaterial(scene);
      material.vampMeshPhysicalMaterial(physicalMaterial);

      // Set anisotropy level
      if (material.map != null) {
        material.map.anisotropy = renderer.capabilities.getMaxAnisotropy();
      }
      // Set normal map filtering
      if (material.normalMap != null) {
        material.normalMap.anisotropy =
            renderer.capabilities.getMaxAnisotropy();
      }

      object.material = material;
    }
  });
}
