import type { Matrix4 } from 'three/src/math/Matrix4';
import type { Texture } from 'three/src/textures/Texture';

export default interface Ibl {
  radiance: Texture;
  irradiance: Texture;
  matrix: Matrix4;
}
