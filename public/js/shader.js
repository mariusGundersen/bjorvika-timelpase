export const vs = `
  attribute vec4 aVertexPosition;
  attribute vec2 aTextureCoord;

  varying highp vec2 vTextureCoord;

  void main(void) {
    gl_Position = aVertexPosition * vec4(1.0, -1.0, 1.0, 1.0);
    vTextureCoord = aTextureCoord;
  }
`;

export const fs = `
  precision highp float;

  varying highp vec2 vTextureCoord;

  uniform sampler2D uSampler;
  uniform vec4 uRotate;

  const float PI = 3.141592653589793;
  const vec2 toRad = vec2(2.0 * PI, PI);
  const vec2 center = vec2(0.0, 0.5);

  vec3 PRotateX(vec3 p, float theta) {
    return vec3(
      p.x,
      p.y * cos(theta) + p.z * sin(theta),
      -p.y * sin(theta) + p.z * cos(theta)
    );
  }

  vec3 PRotateY(vec3 p, float theta) {
    return vec3(
      p.x * cos(theta) - p.z * sin(theta),
      p.y,
      p.x * sin(theta) + p.z * cos(theta)
    );
  }

  vec3 PRotateZ(vec3 p, float theta) {
    return vec3(
      p.x * cos(theta) + p.y * sin(theta),
      -p.x * sin(theta) + p.y * cos(theta),
      p.z
    );
  }

  float atan2(float y, float x) {
    if (x > 0.0) {
      return atan(y/x);
    } else if (x < 0.0 && y >= 0.0) {
      return atan(y/x) + PI;
    } else if (x < 0.0 && y < 0.0) {
      return atan(y/x) - PI;
    } else if (x == 0.0 && y > 0.0) {
      return PI/2.0;
    } else if (x == 0.0 && y < 0.0) {
      return -PI/2.0;
    }
  }

  void main(void) {
    vec2 latLong = (vTextureCoord - center) * toRad;

    vec3 ray = vec3(
      cos(latLong.y) * sin(latLong.x),
      sin(latLong.y),
      cos(latLong.y) * cos(latLong.x)
    );

    ray = PRotateX(ray, uRotate.x * 2.0*PI);
    ray = PRotateY(ray, uRotate.y * 2.0*PI);
    ray = PRotateZ(ray, uRotate.z * 2.0*PI);

    vec2 thetaPhi = vec2(
      atan2(ray.x, ray.z),
      asin(ray.y)
    );

    vec2 coord = thetaPhi/toRad + center;
    gl_FragColor = texture2D(uSampler, coord);
  }
`;
