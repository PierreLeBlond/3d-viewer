in vec3 vertex_in;

out vec3 uv_out;

void main() {
    vec4 world_position = modelMatrix * vec4(vertex_in, 1.0);
    uv_out = world_position.xyz;

    vec4 projection_position = projectionMatrix * mat4(mat3(viewMatrix)) * modelMatrix * world_position;
    gl_Position = projection_position.xyww;
}
