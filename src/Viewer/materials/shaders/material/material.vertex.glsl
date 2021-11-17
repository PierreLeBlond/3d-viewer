#define STANDARD
varying vec3 vViewPosition;

#if defined(REFLECTOR)
varying vec4 vPositionW;
#endif

#include <common>
#include <uv_pars_vertex>
#include <uv2_pars_vertex>
#include <color_pars_vertex>
#include <normal_pars_vertex>
#include <skinning_pars_vertex>

#if defined(REFLECTOR)
uniform mat4 reflectorViewMatrix;
uniform mat4 reflectorProjectionMatrix;
#endif

void main() {

#include <uv_vertex>
#include <uv2_vertex>
#include <color_vertex>
#include <beginnormal_vertex>
#include <skinbase_vertex>
#include <skinnormal_vertex>
#include <defaultnormal_vertex>
#include <normal_vertex>
#include <begin_vertex>
#include <skinning_vertex>
#include <project_vertex>

  vViewPosition = - mvPosition.xyz;

#include <worldpos_vertex>

#if defined(REFLECTOR)
  vPositionW = modelMatrix*vec4(position, 1.0);
#endif
}
