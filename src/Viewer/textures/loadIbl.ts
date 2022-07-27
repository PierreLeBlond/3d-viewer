import Ibl from './Ibl';
import loadDdsTexture from './loadDdsTexture';
import loadTexture from './loadTexture';

export default async function loadIbl(
    path: string, name: string): Promise<Ibl> {
  const radiance_filename: string = `${path}/${name}_radiance.dds`;
  const irradiance_filename: string = `${path}/${name}_irradiance.dds`;

  const [radiance, irradiance] = await Promise.all(
      [loadDdsTexture(radiance_filename), loadDdsTexture(irradiance_filename)]);

  return {
    radiance, irradiance
  }
}
