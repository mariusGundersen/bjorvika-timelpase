export default class Texture {
  constructor(gl) {
    this.gl = gl;
    this.texture = this.gl.createTexture() || (() => {throw new Error("Could not make texture")})();
    this.width = 0;
    this.height = 0;
    this.bind();
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  }

  bind(){
    this.gl.bindTexture(this.gl.TEXTURE_2D, this.texture);
  }

  sampler2D(target){
    this.gl.activeTexture(target + this.gl.TEXTURE0);
    this.bind();
    return target;
  }

  load(url){
    return new Promise(res => {
      const image = new Image();
      image.onload = () => {
        this.bind();
        this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, this.gl.RGBA, this.gl.UNSIGNED_BYTE, image);
        this.width = image.width;
        this.height = image.height;

        res(this.texture);
      };
      image.src = url;
    });
  }

  pipe(render, ...params){
    return render(this, ...params);
  }
}

