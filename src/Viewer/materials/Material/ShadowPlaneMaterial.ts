import {
  IUniform,
  ShaderMaterial,
  Texture,
  UniformsLib,
  UniformsUtils,
} from "three";
import fragmentShader from "../shaders/material/shadow_plane.fragment.glsl";
import vertexShader from "../shaders/material/shadow_plane.vertex.glsl";

interface Uniforms {
  [uniform: string]: IUniform;
  map: { value: Texture | null };
}

interface Defines {
  [define: string]: string | number;
}

export default class ShadowPlaneMaterial extends ShaderMaterial {
  declare public uniforms: Uniforms;
  declare public defines: Defines;

  public get map(): Texture | null {
    return this.uniforms["map"].value;
  }
  public set map(map: Texture | null) {
    this.uniforms["map"].value = map;
  }

  public constructor() {
    const uniforms: Uniforms = UniformsUtils.merge([
      UniformsLib.common,
    ]) as Uniforms;

    super({
      name: "shadow_plane_material",
      uniforms,
      vertexShader,
      fragmentShader,
    });
  }
}
