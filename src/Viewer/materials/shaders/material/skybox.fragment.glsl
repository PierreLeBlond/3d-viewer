in vec3 uv_out;

uniform samplerCube radiance;

void main(void) {
  vec3 color = textureCube(radiance, uv_out).rgb;

  color = color / (color + vec3(1.0));
  color = pow(color, vec3(1.0/2.2));

  gl_FragColor = vec4(color, 1.0f);
}
