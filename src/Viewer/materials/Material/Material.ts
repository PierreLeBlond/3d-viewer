import { Color, Matrix4, MeshPhysicalMaterial, Scene, ShaderMaterial, TangentSpaceNormalMap, Texture, UniformsLib, UniformsUtils, type IUniform } from 'three';
import type Ibl from '../../textures/Ibl';
import IblSpace from '../../textures/IblSpace';
import fragmentShader from '../shaders/material/material.fragment.glsl';
import vertexShader from '../shaders/material/material.vertex.glsl';

interface Uniforms {
  [uniform: string]: IUniform,
  diffuse: { value: Color },
  map: { value: Texture | null },
  normalMap: { value: Texture | null },
  roughness: { value: number },
  roughnessMap: { value: Texture | null },
  metalness: { value: number },
  metalnessMap: { value: Texture | null },
  alphaMap: { value: Texture | null },
  aoMap: { value: Texture | null },
  aoMapIntensity: { value: number },
  emissiveMap: { value: Texture | null },
  emissive: { value: Color },
  envMap: { value: Texture | null },
  radiance_map: { value: Texture | null },
  irradiance_map: { value: Texture | null },
  ibl_matrix: { value: Matrix4 },
  brdf_map: { value: Texture | null },
  reflectorMap: { value: Texture | null },
  reflectorDepthMap: { value: Texture | null },
  reflectorMatrix: { value: Matrix4 },
  reflectorProjectionMatrix: { value: Matrix4 },
  reflectorViewMatrix: { value: Matrix4 },
}

export default class Material extends ShaderMaterial {

  public declare uniforms: Uniforms;

  public get color(): Color {
    return this.uniforms['diffuse'].value;
  };
  public set color(color: Color) {
    this.uniforms['diffuse'].value = color;
  }

  public get map(): Texture | null {
    return this.uniforms['map'].value;
  };
  public set map(map: Texture | null) {
    this.uniforms['map'].value = map;
  }

  public get normalMap(): Texture | null {
    return this.uniforms['normalMap'].value;
  };
  public set normalMap(normalMap: Texture | null) {
    this.uniforms['normalMap'].value = normalMap;
  }
  public normalMapType: number;

  public get roughness(): number {
    return this.uniforms['roughness'].value;
  };
  public set roughness(roughness: number) {
    this.uniforms['roughness'].value = roughness;
  }
  public get roughnessMap(): Texture | null {
    return this.uniforms['roughnessMap'].value;
  };
  public set roughnessMap(roughnessMap: Texture | null) {
    this.uniforms['roughnessMap'].value = roughnessMap;
  }

  public get metalness(): number {
    return this.uniforms['metalness'].value;
  };
  public set metalness(metalness: number) {
    this.uniforms['metalness'].value = metalness;
  }
  public get metalnessMap(): Texture | null {
    return this.uniforms['metalnessMap'].value;
  };
  public set metalnessMap(metalnessMap: Texture | null) {
    this.uniforms['metalnessMap'].value = metalnessMap;
  }

  public get alphaMap(): Texture | null {
    return this.uniforms['alphaMap'].value;
  };
  public set alphaMap(alphaMap: Texture | null) {
    this.uniforms['alphaMap'].value = alphaMap;
  }

  public get aoMap(): Texture | null {
    return this.uniforms['aoMap'].value;
  };
  public set aoMap(aoMap: Texture | null) {
    this.uniforms['aoMap'].value = aoMap;
  }
  public get aoMapIntensity(): number {
    return this.uniforms['aoMapIntensity'].value;
  };
  public set aoMapIntensity(aoMapIntensity: number) {
    this.uniforms['aoMapIntensity'].value = aoMapIntensity;
  }

  public get emissiveMap(): Texture | null {
    return this.uniforms['emissiveMap'].value;
  };
  public set emissiveMap(emissiveMap: Texture | null) {
    this.uniforms['emissiveMap'].value = emissiveMap;
  }
  public get emissive(): Color {
    return this.uniforms['emissive'].value;
  };
  public set emissive(emissive: Color) {
    this.uniforms['emissive'].value = emissive;
  }

  public get envMap(): Texture | null {
    return this.uniforms['envMap'].value;
  };
  public set envMap(envMap: Texture | null) {
    this.uniforms['envMap'].value = envMap;
  }

  private internalIbl: Ibl | null = null;
  public get ibl(): Ibl | null {
    return this.internalIbl;
  }
  public set ibl(ibl: Ibl | null) {
    this.internalIbl = ibl;
    this.uniforms['radiance_map'].value = ibl?.radiance ?? null;
    this.uniforms['irradiance_map'].value = ibl?.irradiance ?? null;
    this.uniforms['ibl_matrix'].value = ibl?.matrix ?? new Matrix4();
  }

  private internalBrdf: Texture | null = null;
  public get brdf(): Texture | null {
    return this.internalBrdf;
  }
  public set brdf(brdf: Texture | null) {
    this.internalBrdf = brdf;
    this.uniforms['brdf_map'].value = brdf;
  }

  public get reflectorMap(): Texture | null {
    return this.uniforms['reflectorMap'].value;
  };
  public set reflectorMap(reflectorMap: Texture | null) {
    this.uniforms['reflectorMap'].value = reflectorMap;
    this.needsUpdate = true;
  }
  public get reflectorDepthMap(): Texture | null {
    return this.uniforms['reflectorDepthMap'].value;
  };
  public set reflectorDepthMap(reflectorDepthMap: Texture | null) {
    this.uniforms['reflectorDepthMap'].value = reflectorDepthMap;
  }
  public get reflectorMatrix(): Matrix4 {
    return this.uniforms['reflectorMatrix'].value;
  };
  public set reflectorMatrix(reflectorMatrix: Matrix4) {
    this.uniforms['reflectorMatrix'].value = reflectorMatrix;
  }
  public get reflectorProjectionMatrix(): Matrix4 {
    return this.uniforms['reflectorProjectionMatrix'].value;
  };
  public set reflectorProjectionMatrix(reflectorProjectionMatrix: Matrix4) {
    this.uniforms['reflectorProjectionMatrix'].value = reflectorProjectionMatrix;
  }
  public get reflectorViewMatrix(): Matrix4 {
    return this.uniforms['reflectorViewMatrix'].value;
  };
  public set reflectorViewMatrix(reflectorViewMatrix: Matrix4) {
    this.uniforms['reflectorViewMatrix'].value = reflectorViewMatrix;
  }

  public isMeshPhysicalMaterial: boolean;

  public scene: Scene;

  private constructor(scene: Scene) {
    const uniforms: Uniforms = UniformsUtils.merge([
      UniformsLib.common, UniformsLib.envmap, UniformsLib.roughnessmap,
      UniformsLib.metalnessmap, UniformsLib.normalmap, UniformsLib.aomap,
      UniformsLib.emissivemap,
      UniformsLib.lights, {
        envMapIntensity: { value: 1 },
        roughness: { value: 1.0 },
        metalness: { value: 1.0 },
        emissive: { value: new Color(0x000000) },
        radiance_map: { value: null },
        irradiance_map: { value: null },
        ibl_matrix: { value: new Matrix4() },
        brdf_map: { value: null },
        reflectorMap: { value: null },
        reflectorDepthMap: { value: null },
        reflectorMatrix: { value: new Matrix4() },
        reflectorProjectionMatrix: { value: new Matrix4() },
        reflectorViewMatrix: { value: new Matrix4() }
      }
    ]);

    super({
      name: 'material',
      uniforms,
      vertexShader,
      fragmentShader,
      lights: true
    });

    this.scene = scene;

    this.isMeshPhysicalMaterial = true;

    this.extensions.shaderTextureLOD = true;

    this.normalMapType = TangentSpaceNormalMap;
  }

  public static create(scene: Scene) {
    const material = new Material(scene);
    return material;
  }

  public override onBeforeCompile() {
    if (!!this.reflectorMap) {
      this.defines['REFLECTOR'] = '';
    } else {
      delete this.defines['REFLECTOR'];
    }

    if (this.scene.userData['iblSpace'] == IblSpace.View) {
      this.defines['IBL_IN_VIEW_SPACE'] = '';
    } else {
      delete this.defines['IBL_IN_VIEW_SPACE'];
    }
  }

  public override customProgramCacheKey(): string {
    const reflectorCacheKey = !!this.reflectorMap ? 'reflector' : '';
    const iblInViewSpaceCacheKey =
      this.scene.userData['iblSpace'] == IblSpace.View ? 'iblInViewSpace' : '';
    return `${reflectorCacheKey}${iblInViewSpaceCacheKey}`;
  }

  public vampMeshPhysicalMaterial(material: MeshPhysicalMaterial) {
    this.color.copy(material.color);
    this.map = material.map;
    this.normalMap = material.normalMap;
    this.roughness = material.roughness;
    this.roughnessMap = material.roughnessMap;
    this.metalness = material.metalness;
    this.metalnessMap = material.metalnessMap;
    this.alphaMap = material.alphaMap;
    this.aoMap = material.aoMap;
    this.aoMapIntensity = material.aoMapIntensity;
    this.emissiveMap = material.emissiveMap;
    this.emissive.copy(material.emissive);
  }
}
