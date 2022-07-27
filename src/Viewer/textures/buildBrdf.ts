import {PerspectiveCamera} from 'three/src/cameras/PerspectiveCamera';
import {NearestFilter, RGBAFormat} from 'three/src/constants';
import {PlaneGeometry} from 'three/src/geometries/PlaneGeometry';
import {ShaderMaterial} from 'three/src/materials/ShaderMaterial';
import {Mesh} from 'three/src/objects/Mesh';
import {WebGLRenderer} from 'three/src/renderers/WebGLRenderer';
import {WebGLRenderTarget} from 'three/src/renderers/WebGLRenderTarget';

import fragmentShader from '../materials/shaders/material/brdf.fragment.glsl';
import vertexShader from '../materials/shaders/material/brdf.vertex.glsl';

export default function buildBrdf(
    renderer: WebGLRenderer, camera: PerspectiveCamera) {
  const width = 256;
  const height = 256;

  const geometry = new PlaneGeometry(2, 2);

  const material =
      new ShaderMaterial({uniforms: {}, vertexShader, fragmentShader});

  const mesh = new Mesh(geometry, material);

  const renderTarget = new WebGLRenderTarget(
      width, height,
      {minFilter: NearestFilter, magFilter: NearestFilter, format: RGBAFormat});

  renderer.setRenderTarget(renderTarget);

  renderer.render(mesh, camera);

  renderer.setRenderTarget(null);

  return renderTarget.texture;
}
