import { TangentSpaceNormalMap } from "three/src/constants";
import { MeshPhysicalMaterial } from "three/src/materials/MeshPhysicalMaterial";
import { ShaderMaterial } from "three/src/materials/ShaderMaterial";
import { Color } from "three/src/math/Color";
import { Matrix3 } from "three/src/math/Matrix3";
import { Matrix4 } from "three/src/math/Matrix4";
import { UniformsLib } from "three/src/renderers/shaders/UniformsLib";
import { mergeUniforms } from "three/src/renderers/shaders/UniformsUtils";
import { Texture } from "three/src/textures/Texture";
import fragmentShader from "../shaders/material/material.fragment.glsl";
import vertexShader from "../shaders/material/material.vertex.glsl";

export default class Material extends ShaderMaterial {

  public get color(): Color {
    return this.uniforms.diffuse.value;
  };
  public set color(color: Color) {
    this.uniforms.diffuse.value = color;
  }

  public get map(): Texture {
    return this.uniforms.map.value;
  };
  public set map(map: Texture) {
    this.uniforms.map.value = map;
  }

  public get normalMap(): Texture {
    return this.uniforms.normalMap.value;
  };
  public set normalMap(normalMap: Texture) {
    this.uniforms.normalMap.value = normalMap;
  }
  public normalMapType: number;

  public get roughness(): number {
    return this.uniforms.roughness.value;
  };
  public set roughness(roughness: number) {
    this.uniforms.roughness.value = roughness;
  }
  public get roughnessMap(): Texture {
    return this.uniforms.roughnessMap.value;
  };
  public set roughnessMap(roughnessMap: Texture) {
    this.uniforms.roughnessMap.value = roughnessMap;
  }

  public get metalness(): number {
    return this.uniforms.metalness.value;
  };
  public set metalness(metalness: number) {
    this.uniforms.metalness.value = metalness;
  }
  public get metalnessMap(): Texture {
    return this.uniforms.metalnessMap.value;
  };
  public set metalnessMap(metalnessMap: Texture) {
    this.uniforms.metalnessMap.value = metalnessMap;
  }

  public get alphaMap(): Texture {
    return this.uniforms.alphaMap.value;
  };
  public set alphaMap(alphaMap: Texture) {
    this.uniforms.alphaMap.value = alphaMap;
  }

  public get aoMap(): Texture {
    return this.uniforms.aoMap.value;
  };
  public set aoMap(aoMap: Texture) {
    this.uniforms.aoMap.value = aoMap;
  }
  public get aoMapIntensity(): number {
    return this.uniforms.aoMapIntensity.value;
  };
  public set aoMapIntensity(aoMapIntensity: number) {
    this.uniforms.aoMapIntensity.value = aoMapIntensity;
  }

  public get envMap(): Texture {
    return this.uniforms.envMap.value;
  };
  public set envMap(envMap: Texture) {
    this.uniforms.envMap.value = envMap;
  }

  public get reflectorMap(): Texture {
    return this.uniforms.reflectorMap.value;
  };
  public set reflectorMap(reflectorMap: Texture) {
    this.uniforms.reflectorMap.value = reflectorMap;
    this.needsUpdate = true;
  }
  public get reflectorDepthMap(): Texture {
    return this.uniforms.reflectorDepthMap.value;
  };
  public set reflectorDepthMap(reflectorDepthMap: Texture) {
    this.uniforms.reflectorDepthMap.value = reflectorDepthMap;
  }
  public get reflectorMatrix(): Matrix4 {
    return this.uniforms.reflectorMatrix.value;
  };
  public set reflectorMatrix(reflectorMatrix: Matrix4) {
    this.uniforms.reflectorMatrix.value = reflectorMatrix;
  }
  public get reflectorProjectionMatrix(): Matrix4 {
    return this.uniforms.reflectorProjectionMatrix.value;
  };
  public set reflectorProjectionMatrix(reflectorProjectionMatrix: Matrix4) {
    this.uniforms.reflectorProjectionMatrix.value = reflectorProjectionMatrix;
  }
  public get reflectorViewMatrix(): Matrix4 {
    return this.uniforms.reflectorViewMatrix.value;
  };
  public set reflectorViewMatrix(reflectorViewMatrix: Matrix4) {
    this.uniforms.reflectorViewMatrix.value = reflectorViewMatrix;
  }

  public isMeshStandardMaterial: boolean;

  public constructor() {
    const uniforms: {[n: string]: { value: any }} = mergeUniforms([
      UniformsLib.common,
      UniformsLib.envmap,
      UniformsLib.roughnessmap,
      UniformsLib.metalnessmap,
      UniformsLib.normalmap,
      UniformsLib.aomap,
      {
        envMapIntensity: { value: 1 },
        roughness: { value: 1.0 },
        metalness: { value: 1.0 },
        reflectorMap: { value: null },
        reflectorDepthMap: { value: null },
        reflectorMatrix: { value: new Matrix4() },
        reflectorProjectionMatrix: { value: new Matrix4() },
        reflectorViewMatrix: { value: new Matrix4() }
      }
    ]);

    super({
      uniforms,
      vertexShader,
      fragmentShader
    });

    this.normalMapType = TangentSpaceNormalMap;
  }

  public onBeforeCompile() {
    if (!!this.reflectorMap) {
      this.defines.REFLECTOR = "";
    } else {
      delete this.defines.REFLECTOR;
    }
  }

  public customProgramCacheKey(): string {
    return !!this.reflectorMap ? "reflector" : "";
  }

  public vampMeshPhysicalMaterial(material: MeshPhysicalMaterial) {
    material.color.copy(this.color);
    this.map = material.map;
    this.normalMap = material.normalMap;
    this.roughness = material.roughness;
    this.roughnessMap = material.roughnessMap;
    this.metalness = material.metalness;
    this.metalnessMap = material.metalnessMap;
    this.alphaMap = material.alphaMap;
    this.aoMap = material.aoMap;
    this.aoMapIntensity = material.aoMapIntensity;
  }

}
