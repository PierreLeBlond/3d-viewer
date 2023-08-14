#define STANDARD

const float kMaxRadianceLod = 9.0;

uniform vec3 diffuse;
uniform vec3 emissive;
uniform float roughness;
uniform float metalness;
uniform float opacity;

uniform samplerCube irradiance_map;
uniform samplerCube radiance_map;
uniform sampler2D brdf_map;

uniform mat4 ibl_matrix;

varying vec3 vViewPosition;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <aomap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <bsdfs>
#include <cube_uv_reflection_fragment>
#include <envmap_common_pars_fragment>

vec3 FresnelSchlickRoughness(float cos_theta, vec3 f_0, float roughness) {
  return f_0 + (max(vec3(1.0 - roughness), f_0) - f_0) * pow(clamp(1.0 - cos_theta, 0.0, 1.0), 5.0);
}

#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_physical_pars_fragment>
#include <normalmap_pars_fragment>
#include <roughnessmap_pars_fragment>
#include <metalnessmap_pars_fragment>

/*vec3 toneMap(vec3 hdrColor) {
  // ACES APPROXIMATION from https://knarkowicz.wordpress.com/2016/01/06/aces-filmic-tone-mapping-curve/
  hdrColor *= 0.6;
  float a = 2.51;
  float b = 0.03;
  float c = 2.43;
  float d = 0.59;
  float e = 0.14;
  hdrColor = clamp((hdrColor*(a*hdrColor+b))/(hdrColor*(c*hdrColor+d)+e), 0.0, 1.0);

  return hdrColor;
}

vec3 untoneMap(vec3 hdrColor) {
  // ACES INVERSE APPROXIMATION from https://knarkowicz.wordpress.com/2016/01/06/aces-filmic-tone-mapping-curve/
  // See https://www.symbolab.com/solver/function-inverse-calculator/inverse%20f%5Cleft(x%5Cright)%3D%5Cfrac%7B%5Cleft(2.51%5Ccdot%20x%5E%7B2%7D%20%2B%200.03%5Ccdot%20x%5Cright)%7D%7B2.43%5Ccdot%20x%5E%7B2%7D%20%2B0.59%5Ccdot%20x%20%2B%200.14%7D
  float a = -0.59;
  float b = 0.03;
  float c = -1.0127;
  float d = 1.3702;
  float e = 0.0009;
  float f = 2.43;
  float g = 2.51;
  hdrColor = (a*hdrColor + b - sqrt(c*hdrColor*hdrColor + d*hdrColor + e))/(2.0*(f*hdrColor - g));
  hdrColor /= 0.6;

  return hdrColor;
}*/

vec3 RGBDToHDR(vec4 rgbd) {
  return rgbd.bgr/rgbd.a;
}

vec3 toneMap(vec3 hdrColor) {
  return hdrColor/(hdrColor + vec3(1.0));
}

vec3 untoneMap(vec3 ldrColor) {
  return ldrColor/(vec3(1.0) - ldrColor);
}

float UnpackFrom16Bits(vec2 packed_value) {
  const vec2 bit_shift = vec2(1.0 / 255.0, 1.0);
  return dot(packed_value, bit_shift);
}

#if defined(REFLECTOR)
uniform sampler2D reflectorMap;
uniform sampler2D reflectorDepthMap;

uniform mat4 projectionMatrix;

uniform mat4 reflectorViewMatrix;
uniform mat4 reflectorProjectionMatrix;
uniform mat4 reflectorMatrix;

#endif

varying vec4 world_position_out;

vec3 GetConductorMultipleScattering(float n_dot_v, float roughness, vec3 color, vec3 irradiance, vec3 radiance) {
  vec3 f_0 = color;

  // Correction at low roughness for dielectrics, from Fdez-Aguera
  vec3 k_s = FresnelSchlickRoughness(n_dot_v, f_0, roughness);

  vec4 packed_sample = texture2D(brdf_map, vec2(n_dot_v, roughness));
  vec2 F_ab = vec2(UnpackFrom16Bits(packed_sample.xy), UnpackFrom16Bits(packed_sample.zw));
  vec3 FssEss = k_s * F_ab.x + F_ab.y;


  // Adding multiple scattering, from Fdez-Aguera
  float Ess = F_ab.x + F_ab.y;
  float Ems = 1.0 - Ess;
  vec3 Favg = f_0 + (1.0 - f_0) / 21.0;
  vec3 Fms = FssEss * Favg / (1.0 - (1.0 - Ess) * Favg);

  return FssEss * radiance + (Fms * Ems) * irradiance;
}

vec3 GetDielectricMultipleScattering(float n_dot_v, float roughness, vec3 color, vec3 irradiance, vec3 radiance) {
  vec3 f_0 = vec3(0.04);

  // Correction at low roughness for dielectrics, from Fdez-Aguera
  vec3 k_s = FresnelSchlickRoughness(n_dot_v, f_0, roughness);

  vec4 packed_sample = texture2D(brdf_map, vec2(n_dot_v, roughness));
  vec2 F_ab = vec2(UnpackFrom16Bits(packed_sample.xy), UnpackFrom16Bits(packed_sample.zw));
  vec3 FssEss = k_s * F_ab.x + F_ab.y;


  // Adding multiple scattering, from Fdez-Aguera
  float Ess = F_ab.x + F_ab.y;
  float Ems = 1.0 - Ess;
  vec3 Favg = f_0 + (1.0 - f_0) / 21.0;
  vec3 Fms = FssEss * Favg / (1.0 - (1.0 - Ess) * Favg);

  vec3 Edss = 1.0 - (FssEss + Fms * Ems);
  vec3 k_d = color * Edss;

  return FssEss * radiance + (Fms * Ems + k_d) * irradiance;
}

void main() {
  vec4 diffuseColor = vec4(pow(diffuse, vec3(2.2)), opacity);
  ReflectedLight reflectedLight = ReflectedLight(vec3(0.0), vec3(0.0), vec3(0.0), vec3(0.0));
  vec3 totalEmissiveRadiance = emissive;

  #if defined(USE_MAP)
    vec4 diffuse_color_sample = texture2D(map, vMapUv);
    diffuseColor *= pow(diffuse_color_sample, vec4(2.2));
  #endif

#include <alphamap_fragment>
#include <alphatest_fragment>
#include <roughnessmap_fragment>
#include <metalnessmap_fragment>
#include <normal_fragment_begin>
#include <normal_fragment_maps>
#include <emissivemap_fragment>

  // accumulation
#include <lights_physical_fragment>
#include <lights_fragment_begin>

vec3 ambient = vec3(0.0);

#if defined(IBL)
  vec3 world_normal = inverseTransformDirection(normal, viewMatrix);
  vec3 view_vector = normalize(cameraPosition - world_position_out.xyz);

  float n_dot_v = max(dot(world_normal, view_vector), 0.0);

  #if defined(IBL_IN_VIEW_SPACE)
    vec3 irradiance_normal = vec3(ibl_matrix * vec4(normal, 0.0));
  #else
    vec3 irradiance_normal = vec3(ibl_matrix * vec4(world_normal, 0.0));
  #endif
  irradiance = RGBDToHDR(textureCube(irradiance_map, irradiance_normal));

  float lowerLevel = floor(roughnessFactor * kMaxRadianceLod);
  float upperLevel = ceil(roughnessFactor * kMaxRadianceLod);

  vec3 reflection_vector = reflect(-view_vector, world_normal);
  // Mixing the reflection with the normal is more accurate and keeps rough objects from gathering light from behind their tangent plane.
  reflection_vector = normalize(mix(reflection_vector, world_normal, roughnessFactor * roughnessFactor));
  reflection_vector = vec3(ibl_matrix * vec4(reflection_vector, 0.0));
  #if defined(IBL_IN_VIEW_SPACE)
    reflection_vector = vec3(viewMatrix * vec4(reflection_vector, 0.0));
  #endif

  vec3 lowerRadianceSample = RGBDToHDR(textureCubeLodEXT(radiance_map, reflection_vector, lowerLevel));
  vec3 upperRadianceSample = RGBDToHDR(textureCubeLodEXT(radiance_map, reflection_vector, upperLevel));
  radiance = mix(lowerRadianceSample, upperRadianceSample, (roughnessFactor * kMaxRadianceLod - lowerLevel));

  #if defined(REFLECTOR)
    vec4 positionClip = projectionMatrix*viewMatrix*world_position_out;
    vec3 positionNDC = positionClip.xyz / positionClip.w;
    vec2 uv = positionNDC.xy*0.5 + 0.5;

    vec4 reflectorNormal = reflectorMatrix*vec4(0.0, 0.0, 1.0, 0.0);
    float orientationFactor = step(0.0, dot(reflectorNormal.xyz, normal));

    float reflectorDepth = texture2D(reflectorDepthMap, uv).x;

    vec4 reflectorTexel = texture2D(reflectorMap, uv);

    reflectorTexel.rgb = pow(reflectorTexel.rgb, vec3(2.2));
    reflectorTexel.rgb = untoneMap(reflectorTexel.rgb);

    radiance = mix(radiance, reflectorTexel.rgb, orientationFactor*(1.0 - step(1.0, reflectorDepth)));
  #endif

  ambient = mix(GetDielectricMultipleScattering(n_dot_v, roughnessFactor, diffuseColor.rgb, irradiance, radiance),
                     GetConductorMultipleScattering(n_dot_v, roughnessFactor, diffuseColor.rgb, irradiance, radiance), metalnessFactor);

#endif

#if defined(USE_AOMAP)
  vec3 occlusion = texture2D(aoMap, vAoMapUv).rgb;
  ambient *= occlusion;
#endif

vec3 totalDiffuse = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse;
vec3 totalSpecular = reflectedLight.directSpecular + reflectedLight.indirectSpecular;
vec3 outgoingLight = totalDiffuse + totalSpecular + ambient + totalEmissiveRadiance;

#include <opaque_fragment>
gl_FragColor.xyz = toneMap(gl_FragColor.xyz);
gl_FragColor.xyz = pow(gl_FragColor.xyz, vec3(1.0/2.2));
#include <premultiplied_alpha_fragment>
#include <dithering_fragment>
}
