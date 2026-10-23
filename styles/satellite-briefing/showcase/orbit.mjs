// A small geographic globe for the page. NASA's equirectangular photograph is
// sampled on a sphere; the Singapore marker is projected from the same basis.
export async function startOrbit(canvas, marker) {
  const field = canvas.parentElement
  const gl = canvas.getContext('webgl', { alpha: false, antialias: true })
  if (!gl) { field.classList.add('unavailable'); return }
  const compile = (type, source) => {
    const shader = gl.createShader(type)
    gl.shaderSource(shader, source)
    gl.compileShader(shader)
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) throw new Error('Orbit shader unavailable')
    return shader
  }
  const program = gl.createProgram()
  gl.attachShader(program, compile(gl.VERTEX_SHADER, 'attribute vec2 position;varying vec2 uv;void main(){uv=position;gl_Position=vec4(position,0.,1.);}'))
  gl.attachShader(program, compile(gl.FRAGMENT_SHADER, `
    precision highp float;
    varying vec2 uv;
    uniform sampler2D earth;
    uniform float aspect;
    uniform vec3 axis, east, north;
    const float distance=2.8;
    const float focal=2.25;
    void main(){
      vec3 ray=normalize(vec3(uv.x*aspect/focal,uv.y/focal,-1.));
      float b=distance*ray.z;
      float disc=b*b-distance*distance+1.;
      vec3 bg=vec3(7.,11.,14.)/255.;
      if(disc<0.){
        float rim=exp(-sqrt(-disc)*23.);
        gl_FragColor=vec4(bg+vec3(.035,.10,.18)*rim,1.);return;
      }
      vec3 n=normalize(vec3(0.,0.,distance)+ray*(-b-sqrt(disc)));
      vec3 globe=n.x*east+n.y*north+n.z*axis;
      vec2 st=vec2((atan(globe.z,globe.x)+3.14159265)/6.2831853,.5-asin(globe.y)/3.14159265);
      vec3 rgb=texture2D(earth,st).rgb;
      float daylight=.40+.60*max(dot(n,normalize(vec3(-.65,.45,1.))),0.);
      float limb=max(dot(n,-ray),0.);
      rgb=pow(rgb,vec3(.86))*daylight*.95;
      rgb=mix(rgb,vec3(.08,.20,.34),pow(1.-limb,4.)*.6);
      gl_FragColor=vec4(rgb,1.);
    }
  `))
  gl.linkProgram(program)
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw new Error('Orbit program unavailable')
  gl.useProgram(program)
  const buffer = gl.createBuffer()
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]), gl.STATIC_DRAW)
  const location = gl.getAttribLocation(program, 'position')
  gl.enableVertexAttribArray(location)
  gl.vertexAttribPointer(location, 2, gl.FLOAT, false, 0, 0)
  const texture = gl.createTexture()
  gl.bindTexture(gl.TEXTURE_2D, texture)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
  const photo = new Image()
  photo.src = '/_projects/satellite-film/assets/plates/world.jpg'
  await photo.decode()
  gl.texImage2D(gl.TEXTURE_2D,0,gl.RGB,gl.RGB,gl.UNSIGNED_BYTE,photo)
  const uniforms = Object.fromEntries(['aspect','axis','east','north'].map(key => [key, gl.getUniformLocation(program,key)]))
  const radians = Math.PI / 180
  const vector = (lat, lon) => [Math.cos(lat*radians)*Math.cos(lon*radians), Math.sin(lat*radians), Math.cos(lat*radians)*Math.sin(lon*radians)]
  const dot = (a,b) => a.reduce((sum,n,i) => sum+n*b[i],0)
  const singapore = vector(1.35,103.82)
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)')
  let visible = true, frame = 0, previous = -1000, phase = 0
  const draw = () => {
    const width = canvas.clientWidth, height = canvas.clientHeight
    if (!width || !height) return
    const pixelRatio = Math.min(devicePixelRatio || 1,1.6)
    const w = Math.round(width*pixelRatio), h = Math.round(height*pixelRatio)
    if (canvas.width !== w || canvas.height !== h) { canvas.width=w; canvas.height=h; gl.viewport(0,0,w,h) }
    const lat=12, lon=105+Math.sin(phase)*1.2
    const axis=vector(lat,lon), east=[-Math.sin(lon*radians),0,Math.cos(lon*radians)]
    const north=[-Math.sin(lat*radians)*Math.cos(lon*radians),Math.cos(lat*radians),-Math.sin(lat*radians)*Math.sin(lon*radians)]
    gl.uniform1f(uniforms.aspect,width/height)
    for(const [key,value] of Object.entries({axis,east,north})) gl.uniform3fv(uniforms[key],value)
    gl.drawArrays(gl.TRIANGLES,0,6)
    const z=2.8-dot(singapore,axis)
    marker.style.left=`${width/2+dot(singapore,east)/z*2.25*height/2}px`
    marker.style.top=`${height/2-dot(singapore,north)/z*2.25*height/2}px`
    marker.classList.add('ready')
  }
  const tick = now => {
    frame=0
    if (!visible || document.hidden || reduceMotion.matches) return
    if (now-previous>80) { phase+=.003; draw(); previous=now }
    frame=requestAnimationFrame(tick)
  }
  const resume = () => { if (!frame && visible && !document.hidden && !reduceMotion.matches) frame=requestAnimationFrame(tick) }
  const observer = new IntersectionObserver(entries => { visible=entries[0].isIntersecting; resume() })
  observer.observe(canvas)
  new ResizeObserver(draw).observe(canvas)
  document.addEventListener('visibilitychange',resume)
  reduceMotion.addEventListener('change',()=>{draw();resume()})
  canvas.addEventListener('webglcontextlost', event => {event.preventDefault();field.classList.add('unavailable');cancelAnimationFrame(frame)})
  draw();resume()
}
