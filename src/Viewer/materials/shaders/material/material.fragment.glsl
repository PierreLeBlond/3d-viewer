#define STANDARD

const float kMaxRadianceLod = 10.0;

uniform vec3 diffuse;
uniform float roughness;
uniform float metalness;
uniform float opacity;

uniform samplerCube radiance_map;
uniform samplerCube irradiance_map;
uniform sampler2D brdf_map;

varying vec3 vViewPosition;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <uv2_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <aomap_pars_fragment>
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

// vec3 toneMap(vec3 hdrColor) {
  // // ACES APPROXIMATION from https://knarkowicz.wordpress.com/2016/01/06/aces-filmic-tone-mapping-curve/
  // hdrColor *= 0.6;
  // float a = 2.51;
  // float b = 0.03;
  // float c = 2.43;
  // float d = 0.59;
  // float e = 0.14;
  // hdrColor = clamp((hdrColor*(a*hdrColor+b))/(hdrColor*(c*hdrColor+d)+e), 0.0, 1.0);

  // return hdrColor;
// }

// vec3 untoneMap(vec3 hdrColor) {
  // // ACES INVERSE APPROXIMATION from https://knarkowicz.wordpress.com/2016/01/06/aces-filmic-tone-mapping-curve/
  // // See https://www.symbolab.com/solver/function-inverse-calculator/inverse%20f%5Cleft(x%5Cright)%3D%5Cfrac%7B%5Cleft(2.51%5Ccdot%20x%5E%7B2%7D%20%2B%200.03%5Ccdot%20x%5Cright)%7D%7B2.43%5Ccdot%20x%5E%7B2%7D%20%2B0.59%5Ccdot%20x%20%2B%200.14%7D
  // float a = -0.59;
  // float b = 0.03;
  // float c = -1.0127;
  // float d = 1.3702;
  // float e = 0.0009;
  // float f = 2.43;
  // float g = 2.51;
  // hdrColor = (a*hdrColor + b - sqrt(c*hdrColor*hdrColor + d*hdrColor + e))/(2.0*(f*hdrColor - g));
  // hdrColor /= 0.6;

  // return hdrColor;
// }


vec3 RGBDToHDR(vec4 rgbd) {
  return pow(rgbd.bgr/rgbd.a, vec3(2.2));
}

vec3 toneMap(vec3 hdrColor) {
  return hdrColor/(hdrColor + vec3(1.0));
}

vec3 untoneMap(vec3 ldrColor) {
  return ldrColor/(vec3(1.0) - ldrColor);
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

void main() {

  vec4 diffuseColor = vec4(diffuse, opacity);
  ReflectedLight reflectedLight = ReflectedLight(vec3(0.0), vec3(0.0), vec3(0.0), vec3(0.0));

#include <map_fragment>
#include <color_fragment>
#include <alphamap_fragment>
#include <alphatest_fragment>
#include <roughnessmap_fragment>
#include <metalnessmap_fragment>
#include <normal_fragment_begin>
#include <normal_fragment_maps>

  // accumulation
#include <lights_physical_fragment>
#include <lights_fragment_begin>

  diffuseColor.rgb = pow(diffuseColor.rgb, vec3(2.2));

  // ibl
  vec3 world_normal = inverseTransformDirection(normal, viewMatrix);

  vec3 view_vector = normalize(cameraPosition - world_position_out.xyz);

  float n_dot_v = max(dot(world_normal, view_vector), 0.0f);

  vec3 f_0 = vec3(0.04);
  f_0 = mix(f_0, diffuseColor.rgb, metalnessFactor);

  // Correction at low roughness for dielectrics, from Fdez-Aguera
  vec3 k_s = FresnelSchlickRoughness(n_dot_v, f_0, roughnessFactor);

  vec2 brdf  = texture(brdf_map, vec2(n_dot_v, roughnessFactor)).rg;
  vec3 single_scattering_energy = k_s * brdf.x + brdf.y;

  // Adding multiple scattering, from Fdez-Aguera
  float multiple_scattering_raw_energy = (1.0 - (brdf.x + brdf.y));
  vec3 average_fresnel = f_0 + (1.0 - f_0) / 21.0;
  vec3 multiple_scattering_energy = multiple_scattering_raw_energy * single_scattering_energy * average_fresnel / (1.0 - average_fresnel * multiple_scattering_raw_energy);
  vec3 k_d = diffuseColor.rgb * (1.0 - single_scattering_energy - multiple_scattering_energy);

  #if defined(IBL_IN_VIEW_SPACE)
    irradiance = RGBDToHDR(texture(irradiance_map, normal));
  #else
    irradiance = RGBDToHDR(texture(irradiance_map, world_normal));
  #endif

  float lowerLevel = floor(roughnessFactor * kMaxRadianceLod);
  float upperLevel = ceil(roughnessFactor * kMaxRadianceLod);

  vec3 reflection_vector = reflect(-view_vector, world_normal);
  // Mixing the reflection with the normal is more accurate and keeps rough objects from gathering light from behind their tangent plane.
  reflection_vector = normalize(mix(reflection_vector, world_normal, roughnessFactor * roughnessFactor));
  #if defined(IBL_IN_VIEW_SPACE)
    reflection_vector = vec3(viewMatrix * vec4(reflection_vector, 0.0));
  #endif

  vec3 lowerRadianceSample = RGBDToHDR(textureLod(radiance_map, reflection_vector, lowerLevel));
  vec3 upperRadianceSample = RGBDToHDR(textureLod(radiance_map, reflection_vector, upperLevel));
  radiance = mix(lowerRadianceSample, upperRadianceSample, (roughnessFactor * kMaxRadianceLod - lowerLevel));

#if defined(REFLECTOR)
  vec4 positionClip = projectionMatrix*reflectorViewMatrix*world_position_out;
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

  reflectedLight.indirectSpecular += radiance * single_scattering_energy;
  reflectedLight.indirectSpecular += irradiance * multiple_scattering_energy;

  reflectedLight.indirectDiffuse += irradiance * k_d;

  // modulation
#include <aomap_fragment>
  vec3 totalDiffuse = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse;
  vec3 totalSpecular = reflectedLight.directSpecular + reflectedLight.indirectSpecular;
  vec3 outgoingLight = totalDiffuse + totalSpecular;

#include <output_fragment>
  gl_FragColor.xyz = toneMap(gl_FragColor.xyz);
  gl_FragColor.xyz = pow(gl_FragColor.xyz, vec3(1.0/2.2));
#include <premultiplied_alpha_fragment>
#include <dithering_fragment>

}
