#define STANDARD
varying vec3 vViewPosition;

varying vec4 world_position_out;
varying vec3 world_normal_out;

#include <common>
#include <uv_pars_vertex>
#include <color_pars_vertex>
#include <normal_pars_vertex>
#include <skinning_pars_vertex>

#if defined(REFLECTOR)
uniform mat4 reflectorViewMatrix;
uniform mat4 reflectorProjectionMatrix;
#endif

void main() {

#include <uv_vertex>
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

  world_position_out = modelMatrix*vec4(position, 1.0);
}
