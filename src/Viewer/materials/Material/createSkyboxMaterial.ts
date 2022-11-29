import { BackSide } from 'three/src/constants';
import { ShaderMaterial } from 'three/src/materials/ShaderMaterial';
import type { Scene } from 'three/src/scenes/Scene';

import fragmentShader from '../shaders/material/skybox.fragment.glsl';
import vertexShader from '../shaders/material/skybox.vertex.glsl';

export default function createSkyboxMaterial(scene: Scene) {
  const uniforms:
    { [name: string]: any } = { radiance: { type: 't', value: scene.environment } };
  const material = new ShaderMaterial({ uniforms, vertexShader, fragmentShader });
  material.side = BackSide;
  return material;
}
