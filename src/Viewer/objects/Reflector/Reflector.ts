import {DepthTexture, Matrix4, Mesh, NearestFilter, Object3D, RGBAFormat, WebGLRenderTarget} from 'three';
import Material from '../../materials/Material/Material';
import setIblToScene from '../../textures/setIblToScene';
import Viewer from '../../Viewer';

interface ReflectorOptions {
  textureWidth?: number, textureHeight?: number, shader?: number,
}

export default class Reflector extends Object3D {
  public reflectorMatrix: Matrix4 = new Matrix4();
  public renderTarget: WebGLRenderTarget;

  constructor(viewer: Viewer, target: Mesh, options: ReflectorOptions = {}) {
    super();

    const textureWidth = options.textureWidth || 512;
    const textureHeight = options.textureHeight || 512;

    const parameters = {
      minFilter: NearestFilter,
      // minFilter: LinearMipmapLinearFilter,
      magFilter: NearestFilter,
      // magFilter: LinearFilter,
      format: RGBAFormat
    };

    this.renderTarget =
        new WebGLRenderTarget(textureWidth, textureHeight, parameters);
    this.renderTarget.texture.generateMipmaps = true;

    this.renderTarget.depthTexture = new DepthTexture(1024, 1024);

    this.assignReflectorToMesh(target);
    target.traverse((child: Mesh) => this.assignReflectorToMesh(child));

    viewer.addEventListener('updatePreprocesses', ({camera, renderer}) => {
      // Render
      this.renderTarget.texture.encoding = renderer.outputEncoding;

      const currentRenderTarget = renderer.getRenderTarget();

      const currentXrEnabled = renderer.xr.enabled;
      const currentShadowAutoUpdate = renderer.shadowMap.autoUpdate;

      renderer.xr.enabled = false;            // Avoid camera modification
      renderer.shadowMap.autoUpdate = false;  // Avoid re-computing shadows

      renderer.setRenderTarget(this.renderTarget);

      renderer.state.buffers.depth.setMask(
          true);  // make sure the depth buffer is writable so it can be
                  // properly cleared, see #18897

      target.visible = false;

      // Rather than modifying the camera, let's put the world upside down !
      // Also we don't forget to rotate the environment accordingly.
      viewer.scene.scale.set(1.0, -1.0, 1.0);
      viewer.scene.userData.ibl.matrix = viewer.scene.matrixWorld;
      setIblToScene(viewer.scene.userData.ibl, viewer.scene);

      if (renderer.autoClear === false) renderer.clear();
      renderer.render(viewer.scene, viewer.camera);

      viewer.scene.scale.set(1.0, 1.0, 1.0);
      viewer.scene.userData.ibl.matrix = viewer.scene.matrixWorld;
      setIblToScene(viewer.scene.userData.ibl, viewer.scene);

      target.visible = true;

      renderer.xr.enabled = currentXrEnabled;
      renderer.shadowMap.autoUpdate = currentShadowAutoUpdate;

      renderer.setRenderTarget(currentRenderTarget);
    });
  }

  private assignReflectorToMesh(target: Mesh) {
    const material = target.material as Material;
    if (material) {
      material.reflectorMap = this.renderTarget.texture;
      material.reflectorDepthMap = this.renderTarget.depthTexture;

      material.reflectorMatrix = this.matrixWorld;
    }
  }
}
