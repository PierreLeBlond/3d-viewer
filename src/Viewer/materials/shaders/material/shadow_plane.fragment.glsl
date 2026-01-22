#define STANDARD

#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>

void main() {
  gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);

  #if defined(USE_MAP)
    vec4 diffuse_color_sample = texture2D(map, vMapUv);
    gl_FragColor.xyz = pow(diffuse_color_sample.rgb, vec3(2.2));
    gl_FragColor.a = diffuse_color_sample.a;
  #endif

  gl_FragColor.xyz = pow(gl_FragColor.xyz, vec3(1.0/2.2));
}
