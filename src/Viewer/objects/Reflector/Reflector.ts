import { DepthTexture, Matrix4, Mesh, NearestFilter, Object3D, RGBAFormat, WebGLRenderTarget } from 'three';
import type Material from '../../materials/Material/Material';
import type Scene from '../../Scene/Scene';
import type Viewer from '../../Viewer';

interface ReflectorOptions {
  textureWidth?: number, textureHeight?: number, shader?: number,
}

export default class Reflector extends Object3D {
  public reflectorMatrix: Matrix4 = new Matrix4();
  public renderTarget: WebGLRenderTarget;

  private updatePreprocessesEventListener: { ({ camera, renderer }: { camera: any; renderer: any; }): void; (event: THREE.Event & { type: "updatePreprocesses"; } & { target: Viewer; }): void; };

  private viewer: Viewer;

  constructor(viewer: Viewer, scene: Scene, target: Mesh, options: ReflectorOptions = {}) {
    super();

    this.viewer = viewer;

    const textureWidth = options.textureWidth || 512;
    const textureHeight = options.textureHeight || 512;

    const parameters = {
      minFilter: NearestFilter,
      magFilter: NearestFilter,
      format: RGBAFormat
    };

    this.renderTarget =
      new WebGLRenderTarget(textureWidth, textureHeight, parameters);
    this.renderTarget.texture.generateMipmaps = true;

    this.renderTarget.depthTexture = new DepthTexture(1024, 1024);

    this.assignReflectorToMesh(target);
    target.traverse((child: Object3D) => {
      this.assignReflectorToMesh(child as Mesh)
    });

    this.updatePreprocessesEventListener = ({ renderer }) => {
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
      scene.scale.set(1.0, -1.0, 1.0);
      scene.userData['ibl'].matrix = scene.matrixWorld;
      scene.userData['materials'].forEach((material: Material) => {
        material.ibl = scene.userData['ibl'];
      });

      if (renderer.autoClear === false) {
        renderer.clear();
      }
      renderer.render(scene, viewer.camera);

      scene.scale.set(1.0, 1.0, 1.0);
      scene.userData['ibl'].matrix = scene.matrixWorld;
      scene.userData['materials'].forEach((material: Material) => {
        material.ibl = scene.userData['ibl'];
      });

      target.visible = true;

      renderer.xr.enabled = currentXrEnabled;
      renderer.shadowMap.autoUpdate = currentShadowAutoUpdate;

      renderer.setRenderTarget(currentRenderTarget);
    };
  }

  public start() {
    this.viewer.addEventListener('updatePreprocesses', this.updatePreprocessesEventListener);
  }

  public stop() {
    this.viewer.removeEventListener('updatePreprocesses', this.updatePreprocessesEventListener);
  }

  private assignReflectorToMesh(target: Mesh) {
    const material = target.material as Material;
    if (material) {
      material.reflectorMap = this.renderTarget.texture;
      material.reflectorDepthMap = this.renderTarget.depthTexture;

      material.reflectorMatrix = this.matrixWorld;
    }
  }

  public dispose() {
    this.stop();
    this.renderTarget.depthTexture.dispose();
    this.renderTarget.dispose();
  }
}
