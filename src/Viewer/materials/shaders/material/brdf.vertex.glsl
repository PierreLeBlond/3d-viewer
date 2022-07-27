varying vec2 uv_out;

void main(){
  uv_out = position.xy;
  gl_Position = vec4(uv_out, 0.0, 1.0);
}
