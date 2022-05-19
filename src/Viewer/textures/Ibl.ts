import {Texture} from 'three/src/textures/Texture';

export default interface Ibl {
  radiance: Texture;
  irradiance: Texture;
  brdf: Texture;
}
