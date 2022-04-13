import {PMREMGenerator, Texture, WebGLRenderer} from 'three';

export default function getPMREMEnvMap(renderer: WebGLRenderer, hdr: Texture) {
  const pmremGenerator = new PMREMGenerator(renderer);
  pmremGenerator.compileEquirectangularShader();
  const envMap = pmremGenerator.fromEquirectangular(hdr).texture;
  pmremGenerator.dispose();
  return envMap;
}
