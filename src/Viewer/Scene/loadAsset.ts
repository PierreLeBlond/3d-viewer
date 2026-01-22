import {
  LinearSRGBColorSpace,
  Mesh,
  MeshPhysicalMaterial,
  Object3D,
  Scene,
  WebGLRenderer,
} from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import createMaterial from "../materials/Material/createMaterial";

export default async function loadAsset(
  renderer: WebGLRenderer,
  scene: Scene,
  url: string,
  optionalResourcePath?: string,
) {
  const gltfLoader = new GLTFLoader();

  const resourcePath =
    optionalResourcePath ||
    url.match(/(?<base>.+\/)(?:\w|\.)+/)?.groups?.["base"];

  if (!resourcePath) {
    throw new Error(`couldn't find asset base url from ${url}`);
  }

  gltfLoader.resourcePath = resourcePath;

  const asset = await gltfLoader.loadAsync(url);
  asset.scene.name = "main";
  scene.add(asset.scene);

  // dispatch animations
  asset.animations.forEach((animation) => {
    const name = animation.name.split("|")[0];

    if (!name) {
      throw new Error(`couldn't find animation name from ${animation.name}`);
    }

    const object = scene.getObjectByName(name);
    if (object) {
      object.animations.push(animation);
    } else {
      scene.animations.push(animation);
    }
  });

  // fix imported textures
  scene.traverse((object: Object3D) => {
    const mesh = object as Mesh;

    const physicalMaterial = mesh.material as MeshPhysicalMaterial;

    if (physicalMaterial) {
      const material = createMaterial(scene);
      material.vampMeshPhysicalMaterial(physicalMaterial);

      if (material.map != null) {
        // We do our own decoding within fragment shader
        material.map.colorSpace = LinearSRGBColorSpace;
      }

      if (material.normalMap != null) {
        material.normalMap.anisotropy =
          renderer.capabilities.getMaxAnisotropy();
      }

      if (material.aoMap != null) {
        material.aoMap.channel = 1;
        material.aoMap.generateMipmaps = false;
      }

      mesh.material = material;
      physicalMaterial.dispose();
    }
  });

  const materials = new Set();
  const textures = new Set();

  scene.traverse((object: Object3D) => {
    if (object.type == "Mesh") {
      const mesh: Mesh = object as Mesh;
      mesh.geometry.dispose();
      const material: MeshPhysicalMaterial =
        mesh.material as MeshPhysicalMaterial;
      materials.add(material);

      textures.add(material.map);
      textures.add(material.normalMap);
      textures.add(material.roughnessMap);
      textures.add(material.metalnessMap);
      textures.add(material.alphaMap);
      textures.add(material.aoMap);
      textures.add(material.emissiveMap);
    }
  });

  scene.userData["materials"].add(...materials);
  scene.userData["textures"].add(...textures);
}
