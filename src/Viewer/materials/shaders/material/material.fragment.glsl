#define STANDARD

uniform vec3 diffuse;
uniform float roughness;
uniform float metalness;
uniform float opacity;

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

#if defined(USE_ENVMAP)
vec3 getIBLIrradiance(const in vec3 normal) {
#if defined(ENVMAP_TYPE_CUBE_UV)
  vec3 direction = normal;
#if defined(ENVMAP_COORDINATE_WORLD)
  direction = inverseTransformDirection(direction, viewMatrix);
#endif
  vec4 envMapColor = textureCubeUV(envMap, direction, 1.0);
  return PI * envMapColor.rgb * envMapIntensity;
#else
  return vec3(0.0);
#endif
}
vec3 getIBLRadiance(const in vec3 viewDir, const in vec3 normal, const in float roughness) {
#if defined(ENVMAP_TYPE_CUBE_UV)
  vec3 reflectVec = reflect(-viewDir, normal);
  // Mixing the reflection with the normal is more accurate and keeps rough objects from gathering light from behind their tangent plane.
  reflectVec = normalize(mix(reflectVec, normal, roughness * roughness));
#if defined(ENVMAP_COORDINATE_WORLD)
  reflectVec = inverseTransformDirection(reflectVec, viewMatrix);
#endif
  vec4 envMapColor = textureCubeUV(envMap, reflectVec, roughness);
  return envMapColor.rgb * envMapIntensity;
#else
  return vec3(0.0);
#endif
}
#endif

#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_physical_pars_fragment>
#include <normalmap_pars_fragment>
#include <roughnessmap_pars_fragment>
#include <metalnessmap_pars_fragment>

vec3 toneMap(vec3 hdrColor) {
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
}

#if defined(REFLECTOR)
uniform sampler2D reflectorMap;
uniform sampler2D reflectorDepthMap;

uniform mat4 projectionMatrix;

uniform mat4 reflectorViewMatrix;
uniform mat4 reflectorProjectionMatrix;
uniform mat4 reflectorMatrix;

varying vec4 vPositionW;
#endif

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
#include <lights_fragment_maps>

#if defined(REFLECTOR)
  vec4 positionClip = projectionMatrix*reflectorViewMatrix*vPositionW;
  vec3 positionNDC = positionClip.xyz / positionClip.w;
  vec2 uv = positionNDC.xy * 0.5 + 0.5;

  vec4 reflectorNormal = reflectorMatrix*vec4(0.0, 0.0, 1.0, 0.0);
  float orientationFactor = step(0.0, dot(reflectorNormal.xyz, normal));

  float reflectorDepth = texture2D(reflectorDepthMap, uv).x;

  vec4 reflectorTexel = texture2D(reflectorMap, uv);

  reflectorTexel = LinearTosRGB(reflectorTexel);
  reflectorTexel.xyz = untoneMap(reflectorTexel.xyz);

  radiance = mix(radiance, reflectorTexel.xyz, orientationFactor*(1.0 - step(1.0, reflectorDepth)));
#endif

#include <lights_fragment_end>

  // modulation
#include <aomap_fragment>
  vec3 totalDiffuse = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse;
  vec3 totalSpecular = reflectedLight.directSpecular + reflectedLight.indirectSpecular;
  vec3 outgoingLight = totalDiffuse + totalSpecular;
#include <output_fragment>
  gl_FragColor.xyz = toneMap(gl_FragColor.xyz);
#include <encodings_fragment>
#include <premultiplied_alpha_fragment>
#include <dithering_fragment>
}
