import {DepthTexture, Matrix4, Mesh, NearestFilter, Object3D, PerspectiveCamera, Plane, RGBAFormat, Vector3, Vector4, WebGLRenderTarget} from 'three';
import Material from '../../materials/Material/Material';
import Viewer from '../../Viewer';

interface ReflectorOptions {
  textureWidth?: number, textureHeight?: number, clipBias?: number,
      shader?: number,
}

export default class Reflector extends Object3D {
  public reflectorProjectionMatrix: Matrix4 = new Matrix4();
  public reflectorViewMatrix: Matrix4 = new Matrix4();
  public reflectorMatrix: Matrix4 = new Matrix4();
  public textureMatrix: Matrix4 = new Matrix4();

  public renderTarget: WebGLRenderTarget;

  constructor(viewer: Viewer, target: Mesh, options: ReflectorOptions = {}) {
    super();

    const textureWidth = options.textureWidth || 512;
    const textureHeight = options.textureHeight || 512;
    const clipBias = options.clipBias || 0;

    const reflectorPlane = new Plane();
    const normal = new Vector3();
    const reflectorWorldPosition = new Vector3();
    const cameraWorldPosition = new Vector3();
    const rotationMatrix = new Matrix4();
    const lookAtPosition = new Vector3(0, 0, -1);
    const clipPlane = new Vector4();

    const view = new Vector3();
    const cameraTarget = new Vector3();
    const q = new Vector4();

    const virtualCamera = new PerspectiveCamera();

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
      reflectorWorldPosition.setFromMatrixPosition(this.matrixWorld);
      cameraWorldPosition.setFromMatrixPosition(camera.matrixWorld);

      rotationMatrix.extractRotation(this.matrixWorld);

      normal.set(0, 0, 1);
      normal.applyMatrix4(rotationMatrix);

      view.subVectors(reflectorWorldPosition, cameraWorldPosition);

      // Avoid rendering when reflector is facing away

      if (view.dot(normal) > 0) return;

      view.reflect(normal).negate();
      view.add(reflectorWorldPosition);

      rotationMatrix.extractRotation(camera.matrixWorld);

      lookAtPosition.set(0, 0, -1);
      lookAtPosition.applyMatrix4(rotationMatrix);
      lookAtPosition.add(cameraWorldPosition);

      cameraTarget.subVectors(reflectorWorldPosition, lookAtPosition);
      cameraTarget.reflect(normal).negate();
      cameraTarget.add(reflectorWorldPosition);

      virtualCamera.position.copy(view);
      virtualCamera.up.set(0, 1, 0);
      virtualCamera.up.applyMatrix4(rotationMatrix);
      virtualCamera.up.reflect(normal);
      virtualCamera.lookAt(cameraTarget);

      virtualCamera.far = camera.far;  // Used in WebGLBackground

      virtualCamera.updateMatrixWorld();
      virtualCamera.projectionMatrix.copy(camera.projectionMatrix);

      // Update the texture matrix
      this.textureMatrix.set(
          0.5, 0.0, 0.0, 0.5, 0.0, 0.5, 0.0, 0.5, 0.0, 0.0, 0.5, 0.5, 0.0, 0.0,
          0.0, 1.0);
      this.textureMatrix.multiply(virtualCamera.projectionMatrix);
      this.textureMatrix.multiply(virtualCamera.matrixWorldInverse);

      // Now update projection matrix with new clip plane, implementing code
      // from: http://www.terathon.com/code/oblique.html Paper explaining this
      // technique: http://www.terathon.com/lengyel/Lengyel-Oblique.pdf
      reflectorPlane.setFromNormalAndCoplanarPoint(
          normal, reflectorWorldPosition);
      reflectorPlane.applyMatrix4(virtualCamera.matrixWorldInverse);

      clipPlane.set(
          reflectorPlane.normal.x, reflectorPlane.normal.y,
          reflectorPlane.normal.z, reflectorPlane.constant);

      this.reflectorProjectionMatrix.copy(camera.projectionMatrix);
      this.reflectorViewMatrix.copy(virtualCamera.matrixWorldInverse);
      this.reflectorMatrix.copy(this.matrixWorld);

      q.x = (Math.sign(clipPlane.x) +
             this.reflectorProjectionMatrix.elements[8]) /
          this.reflectorProjectionMatrix.elements[0];
      q.y = (Math.sign(clipPlane.y) +
             this.reflectorProjectionMatrix.elements[9]) /
          this.reflectorProjectionMatrix.elements[5];
      q.z = -1.0;
      q.w = (1.0 + this.reflectorProjectionMatrix.elements[10]) /
          this.reflectorProjectionMatrix.elements[14];

      // Calculate the scaled plane vector
      clipPlane.multiplyScalar(2.0 / clipPlane.dot(q));

      // Replacing the third row of the projection matrix
      this.reflectorProjectionMatrix.elements[2] = clipPlane.x;
      this.reflectorProjectionMatrix.elements[6] = clipPlane.y;
      this.reflectorProjectionMatrix.elements[10] =
          clipPlane.z + 1.0 - clipBias;
      this.reflectorProjectionMatrix.elements[14] = clipPlane.w;

      virtualCamera.projectionMatrix.copy(this.reflectorProjectionMatrix);

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

      if (renderer.autoClear === false) renderer.clear();
      renderer.render(viewer.scene, virtualCamera);

      target.visible = true;

      renderer.xr.enabled = currentXrEnabled;
      renderer.shadowMap.autoUpdate = currentShadowAutoUpdate;

      renderer.setRenderTarget(currentRenderTarget);

      // Restore viewport

      // const viewport = camera.viewport;

      // if ( viewport !== undefined ) {

      // renderer.state.viewport( viewport );

      // }
    });
  }

  private assignReflectorToMesh(target: Mesh) {
    const material = target.material as Material;
    if (material) {
      material.reflectorMap = this.renderTarget.texture;
      material.reflectorDepthMap = this.renderTarget.depthTexture;

      material.reflectorMatrix = this.matrixWorld;
      material.reflectorViewMatrix = this.reflectorViewMatrix;
      material.reflectorProjectionMatrix = this.reflectorProjectionMatrix;
    }
  }
}
