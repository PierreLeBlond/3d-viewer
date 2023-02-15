import { BufferGeometry, Color, Mesh, MeshBasicMaterial, type Object3D } from "three";

const wireframeMaterial = new MeshBasicMaterial({
  color: new Color(0x00ff00),
  wireframe: true
});

export const getDisolveData = (object: Object3D) => {
  const meshDatas: {
    mesh: Mesh,
    wireframeMesh: Mesh,
    faceCount: number
  }[] = [];

  object.traverse((children: Object3D) => {
    if (children.type != 'Mesh') {
      return;
    }

    if (children.userData['isDisolveWireframe']) {
      return;
    }

    const mesh = children as Mesh;

    let meshData = mesh.userData['disolveData'];
    if (meshData) {
      meshDatas.push(meshData);
      return;
    }

    const wireframeMesh = new Mesh();
    wireframeMesh.name = `${mesh.name}_wireframe`;

    wireframeMesh.geometry = new BufferGeometry();
    wireframeMesh.geometry.copy(mesh.geometry);

    wireframeMesh.material = wireframeMaterial;

    const meshIndexBuffer = mesh.geometry.getIndex();

    if (!meshIndexBuffer) {
      throw new Error('Mesh should be indexed to be disolved.')
    }

    const faceCount = meshIndexBuffer.count / 3;

    meshData = {
      mesh,
      wireframeMesh,
      faceCount
    };

    wireframeMesh.userData['isDisolveWireframe'] = true;
    mesh.userData['disolveData'] = meshData;

    meshDatas.push(meshData);
  });

  meshDatas.forEach(({ mesh, wireframeMesh }) => {
    const alreadySetChildren = mesh.getObjectByName(`${mesh.name}_wireframe`);
    if (alreadySetChildren) {
      return;
    }

    mesh.add(wireframeMesh);
  });

  return meshDatas;

}