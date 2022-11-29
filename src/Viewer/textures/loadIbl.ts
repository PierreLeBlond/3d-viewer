import { LinearFilter, LinearMipmapLinearFilter } from 'three/src/constants';
import { Matrix4 } from 'three/src/math/Matrix4';
import type Ibl from './Ibl';
import loadDdsTexture from './loadDdsTexture';

export default async function loadIbl(
  irradiancePath: string, radiancePath: string): Promise<Ibl> {
  const [radiance, irradiance] = await Promise.all(
    [loadDdsTexture(radiancePath), loadDdsTexture(irradiancePath)]);

  radiance.minFilter = LinearMipmapLinearFilter;
  irradiance.minFilter = LinearFilter;

  return {
    radiance, irradiance, matrix: new Matrix4()
  }
}
