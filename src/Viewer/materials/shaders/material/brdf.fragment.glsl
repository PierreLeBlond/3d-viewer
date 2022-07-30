const float kPi = 3.14159265359;

varying vec2 uv_out;

float VanDerCorpus(int i, float base) {
  float invBase = 1.0 / base;
  float denom   = 1.0;
  float result  = 0.0;

  int n = i;

  for(int j = 0; j < 32; ++j) {
    if(n > 0) {
      denom   = mod(float(n), 2.0);
      result += denom * invBase;
      invBase = invBase / 2.0;
      n       = int(float(n) / 2.0);
    }
  }

  return result;
}

vec2 Hammersley(int i, int N) {
  return vec2(float(i)/float(N), VanDerCorpus(i, 2.0));
}

vec3 ImportanceSampleGGX(vec2 hammersley_sample, vec3 normal, float roughness) {
  float a = roughness*roughness;

  float phi = 2.0 * kPi * hammersley_sample.x;
  float cos_theta = sqrt((1.0 - hammersley_sample.y) / (1.0 + (a*a - 1.0) * hammersley_sample.y));
  float sin_theta = sqrt(1.0 - cos_theta*cos_theta);

  // from spherical coordinates to cartesian coordinates
  vec3 sample_tangent;
  sample_tangent.x = cos(phi) * sin_theta;
  sample_tangent.y = sin(phi) * sin_theta;
  sample_tangent.z = cos_theta;

  // from tangent-space vector to world-space sample vector
  vec3 up        = abs(normal.z) < 0.999 ? vec3(0.0, 0.0, 1.0) : vec3(1.0, 0.0, 0.0);
  vec3 tangent   = normalize(cross(up, normal));
  vec3 bitangent = cross(normal, tangent);

  vec3 sample_world = tangent * sample_tangent.x + bitangent * sample_tangent.y + normal * sample_tangent.z;
  return normalize(sample_world);
}

// k is different from direct lighting
float GeometrySchlickGGX(float n_dot_v, float roughness) {
  float a = roughness;
  float k = (a*a) / 2.0;

  float num   = n_dot_v;
  float denom = n_dot_v * (1.0 - k) + k;

  return num / denom;
}

float GeometrySmith(float n_dot_v, float n_dot_l, float roughness) {
  float ggx2  = GeometrySchlickGGX(n_dot_v, roughness);
  float ggx1  = GeometrySchlickGGX(n_dot_l, roughness);

  return ggx1 * ggx2;
}

vec2 PackTo16Bits(float value) {
  const vec2 bit_shift = vec2(255.0, 1.0);
  const vec2 bit_mask = vec2(0.0, 1.0 / 255.0);

  vec2 packed_value = fract(value * bit_shift);
  packed_value -= packed_value.xx * bit_mask;

  return packed_value;
}

void main() {
  float n_dot_v = uv_out.x*0.5 + 0.5;
  float roughness = uv_out.y*0.5 + 0.5;

  vec3 view_vector;
  view_vector.x = sqrt(1.0 - n_dot_v*n_dot_v);
  view_vector.y = 0.0;
  view_vector.z = n_dot_v;

  float scale = 0.0;
  float bias = 0.0;

  vec3 normal = vec3(0.0, 0.0, 1.0);

  const int sample_count = 1024;
  for(int i = 0; i < sample_count; ++i) {
    vec2 hammersley_sample = Hammersley(i, sample_count);
    vec3 half_vector  = ImportanceSampleGGX(hammersley_sample, normal, roughness);
    vec3 light_vector  = normalize(2.0 * dot(view_vector, half_vector) * half_vector - view_vector);

    float n_dot_l = max(light_vector.z, 0.0);
    float n_dot_h = max(half_vector.z, 0.0);
    float v_dot_h = max(dot(view_vector, half_vector), 0.0);

    if(n_dot_l > 0.0) {
      float geometry_term = GeometrySmith(n_dot_v, n_dot_l, roughness);
      geometry_term = (geometry_term * v_dot_h) / (n_dot_h * n_dot_v);
      float scale_factor = pow(1.0 - v_dot_h, 5.0);

      scale += (1.0 - scale_factor) * geometry_term;
      bias += scale_factor * geometry_term;
    }
  }
  scale /= float(sample_count);
  bias /= float(sample_count);

  gl_FragColor = vec4(PackTo16Bits(scale), PackTo16Bits(bias));
}
