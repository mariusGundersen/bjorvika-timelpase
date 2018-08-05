export default function initShaderProgram(gl, vsSource, fsSource) {
  const vertexShader = loadShader(gl, gl.VERTEX_SHADER, vsSource);
  const fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, fsSource);

  // Create the shader program

  const program = gl.createProgram();
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);

  // If creating the shader program failed, alert
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    alert('Unable to initialize the shader program: ' + gl.getProgramInfoLog(program));
    return null;
  }

  return {
    program,
    uniforms: createUniforms(gl, program),
    attributes: createAttributes(gl, program),
    bind(){
      gl.useProgram(program);
    }
  };
}

function loadShader(gl, type, source) {
  const shader = gl.createShader(type);

  // Send the source to the shader object

  gl.shaderSource(shader, source);

  // Compile the shader program

  gl.compileShader(shader);

  // See if it compiled successfully

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    alert('An error occurred compiling the shaders: ' + gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    return null;
  }

  return shader;
}

function createAttributes(gl, program){
  const result = {};
  const count = gl.getProgramParameter(program, gl.ACTIVE_ATTRIBUTES);
  for (let i = 0; i < count; ++i) {
    const info = gl.getActiveAttrib(program, i);
    const location = gl.getAttribLocation(program, info.name);
    const name = info.name;

    Object.defineProperty(result, name, {
      enumerable: true,
      get(){
        return location;
      },
      set(value){

      }
    })
    console.log(location, info.name);
  }

  return result;
}

function createUniforms(gl, program){
  const result = {};
  const count = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS);
  for (let i = 0; i < count; ++i) {
    const info = gl.getActiveUniform(program, i);
    const location = gl.getUniformLocation(program, info.name);
    const type = info.type;
    const {name, isArray} = getName(info.name);

    Object.defineProperty(result, name, {
      enumerable: true,
      get(){
        return gl.getUniform(program, location);
      },
      set(value){
        switch(type){
          case gl.FLOAT:
            return isArray ? gl.uniform1fv(location, value) : gl.uniform1f(location, value);
          case gl.FLOAT_VEC2:
            return isArray ? gl.uniform2fv(location, value) : gl.uniform2f(location, value[0], value[1]);
          case gl.FLOAT_VEC3:
            return isArray ? gl.uniform3fv(location, value) : gl.uniform3f(location, value[0], value[1], value[2]);
          case gl.FLOAT_VEC4:
            return isArray ? gl.uniform4fv(location, value) : gl.uniform4f(location, value[0], value[1], value[2], value[3]);
          case gl.INT:
          case gl.SAMPLER_2D:
            return isArray ? gl.uniform1iv(location, value) : gl.uniform1i(location, value);
          case gl.INT_VEC2:
            return isArray ? gl.uniform2iv(location, value) : gl.uniform2i(location, value[0], value[1]);
          case gl.INT_VEC3:
            return isArray ? gl.uniform3iv(location, value) : gl.uniform3i(location, value[0], value[1], value[2]);
          case gl.INT_VEC4:
            return isArray ? gl.uniform4iv(location, value) : gl.uniform4i(location, value[0], value[1], value[2], value[3]);
          default:
            throw new Error(name + ' is unknown type ' + type);
        }
      }
    });
    console.log(location, info.name);
  }

  return result;
}

const getName = name => name.endsWith('[0]') ? {name: name.substr(0, name.length - 3), isArray: true} : {name, isArray: false};