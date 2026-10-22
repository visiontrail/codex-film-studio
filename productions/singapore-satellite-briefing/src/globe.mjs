// An independently authored georeferenced Earth renderer. Units: kilometres.
const R = 6371.0088, rad = Math.PI / 180
export const geo = (lat, lon) => [R*Math.cos(lat*rad)*Math.cos(lon*rad),R*Math.sin(lat*rad),R*Math.cos(lat*rad)*Math.sin(lon*rad)]
const dot=(a,b)=>a.reduce((s,v,i)=>s+v*b[i],0)
const sub=(a,b)=>a.map((v,i)=>v-b[i])
const add=(a,b)=>a.map((v,i)=>v+b[i])
const mul=(a,s)=>a.map(v=>v*s)
const unit=a=>mul(a,1/Math.sqrt(dot(a,a)))
const cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]]
export function camera({lat,lon,d,tilt=0,heading=0,sx=-180,sy=0}){
  const target=geo(lat,lon), vertical=unit(target),east=[-Math.sin(lon*rad),0,Math.cos(lon*rad)],north=unit(cross(east,vertical))
  const h=heading*rad,right=add(mul(east,Math.cos(h)),mul(north,Math.sin(h)))
  const forwardGround=add(mul(north,Math.cos(h)),mul(east,-Math.sin(h)))
  const pos=add(target,mul(add(mul(vertical,Math.cos(tilt*rad)),mul(forwardGround,-Math.sin(tilt*rad))),d))
  const forward=unit(sub(target,pos)),up=unit(cross(forward,right)),f=540/Math.tan(15*rad)
  return {pos,forward,right,up,f,sx,sy,d,altitude:Math.sqrt(dot(pos,pos))-R,lat,lon,tilt,heading,c:dot(pos,pos)-R*R}
}
export function project(cam,lat,lon){
  const q=sub(geo(lat,lon),cam.pos),z=dot(q,cam.forward)
  return [960+cam.sx+dot(q,cam.right)/z*cam.f,540+cam.sy-dot(q,cam.up)/z*cam.f,z]
}
export function groundDistance(cam,x1,y1,x2,y2){
 const unproject=(x,y)=>{const ray=unit(add(cam.forward,add(mul(cam.right,(x-960-cam.sx)/cam.f),mul(cam.up,-(y-540-cam.sy)/cam.f)))),b=dot(cam.pos,ray),disc=b*b-cam.c;if(disc<0)return null;const t=cam.c/(-b+Math.sqrt(disc));return unit(add(cam.pos,mul(ray,t)))}
 const a=unproject(x1,y1),b=unproject(x2,y2);return a&&b?Math.acos(Math.max(-1,Math.min(1,dot(a,b))))*R:null
}
const vs=`#version 300 es
in vec2 a;out vec2 v;void main(){v=a;gl_Position=vec4(a,0.,1.);}`
const frag=`#version 300 es
precision highp float;
in vec2 v;out vec4 color;
uniform vec3 C,F,E,N;uniform float cc,focal,grade,time,colourRadius;uniform vec2 shift,focus;
uniform sampler2D world,region,metro,sg;uniform vec4 rb,mb,sb;
const float R=6371.0088;const float PI=3.14159265359;
float edge(vec2 uv){return smoothstep(0.,.055,min(min(uv.x,uv.y),min(1.-uv.x,1.-uv.y)));}
vec2 uvFor(vec2 ll,vec4 b){return vec2((ll.x-b.x)/(b.z-b.x),(b.w-ll.y)/(b.w-b.y));}
float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
void main(){
 vec2 px=vec2((v.x+1.)*960.,(1.-v.y)*540.);
 vec3 ray=normalize(F+E*((px.x-960.-shift.x)/focal)-N*((px.y-540.-shift.y)/focal));
 float b=dot(C,ray),disc=b*b-cc;
 vec3 sky=vec3(.006,.010,.016);
 if(disc<0.||b>0.){float above=sqrt(max(R*R-disc,0.))-R;float rim=exp(-max(above,0.)/75.);color=vec4(sky+vec3(.07,.20,.47)*rim,1.);return;}
 float t=cc/(-b+sqrt(disc));vec3 p=C+ray*t;vec3 normal=normalize(p);
 vec2 ll=vec2(atan(p.z,p.x),asin(clamp(p.y/R,-1.,1.)))*180./PI;
 vec3 rgb=texture(world,vec2((ll.x+180.)/360.,(90.-ll.y)/180.)).rgb;
 vec2 ru=uvFor(ll,rb),mu=uvFor(ll,mb),su=uvFor(ll,sb);float altitude=length(C)-R;
 rgb=mix(rgb,texture(region,clamp(ru,0.,1.)).rgb,edge(ru));
 rgb=mix(rgb,texture(metro,clamp(mu,0.,1.)).rgb,edge(mu)*(1.-smoothstep(160.,350.,altitude)));
 vec2 texel=1./vec2(textureSize(sg,0));vec2 suv=clamp(su,texel,1.-texel);
 vec3 detail=texture(sg,suv).rgb;
 vec3 blur=(texture(sg,suv+vec2(texel.x,0.)).rgb+texture(sg,suv-vec2(texel.x,0.)).rgb+texture(sg,suv+vec2(0.,texel.y)).rgb+texture(sg,suv-vec2(0.,texel.y)).rgb)*.25;
 detail=clamp(detail+(detail-blur)*.65,0.,1.);
 rgb=mix(rgb,detail,edge(su)*(1.-smoothstep(45.,95.,altitude)));
 float l=dot(rgb,vec3(.2126,.7152,.0722));
 float d=clamp((l-.045)/.855,0.,1.);d=(1.-exp(-1.9*d))/(1.-exp(-1.9));d=mix(d,smoothstep(0.,1.,d),.3);d=pow(d,.96);d*=mix(.62,1.,smoothstep(.08,.60,d));
 vec3 grey=mix(vec3(.026,.036,.044),vec3(.63,.655,.665),d)+(rgb-l)*.10;
 float cr=1.-smoothstep(colourRadius*.80,colourRadius,length((ll-focus)*vec2(cos(focus.y*PI/180.),1.)));
 float g=grade*(1.-cr*step(.0001,colourRadius));rgb=mix(rgb,grey,g);
 float limb=clamp(dot(normal,-ray),0.,1.);float alt=smoothstep(150.,1200.,length(C)-R);rgb= mix(rgb,pow(max(rgb,vec3(0.)),vec3(.86))*1.10,alt*(1.-grade));rgb*=mix(1.,.67+.33*pow(limb,.26),alt);
 rgb+=vec3(.07,.20,.47)*exp(-limb/.10)*alt;
 float vig=1.-.20*pow(length((px-vec2(960.,540.))/vec2(1100.,720.)),1.7);
 rgb*=vig;rgb+=(hash(px+floor(time*24.)*.731)-.5)*.009;
 color=vec4(rgb,1.);
}`
export async function makeGlobe(canvas,manifest){
 const gl=canvas.getContext('webgl2',{alpha:false,preserveDrawingBuffer:true,antialias:false})
 if(!gl)throw Error('WebGL2 required')
 const shader=(type,source)=>{const s=gl.createShader(type);gl.shaderSource(s,source);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw Error(gl.getShaderInfoLog(s));return s}
 const p=gl.createProgram();gl.attachShader(p,shader(gl.VERTEX_SHADER,vs));gl.attachShader(p,shader(gl.FRAGMENT_SHADER,frag));gl.linkProgram(p)
 if(!gl.getProgramParameter(p,gl.LINK_STATUS))throw Error(gl.getProgramInfoLog(p));gl.useProgram(p)
 const b=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,b);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]),gl.STATIC_DRAW)
 const a=gl.getAttribLocation(p,'a');gl.enableVertexAttribArray(a);gl.vertexAttribPointer(a,2,gl.FLOAT,false,0,0)
 const loc=name=>gl.getUniformLocation(p,name)
 const boxes={}
 for(const [i,id] of ['world','region','metro','singapore'].entries()){
  const plate=manifest.plates.find(x=>x.id===id)||(id==='metro'?manifest.plates.find(x=>x.id==='region'):null),im=new Image();if(!plate)throw Error('Missing imagery '+id);im.src=plate.file
  await im.decode();const tx=gl.createTexture();gl.activeTexture(gl.TEXTURE0+i);gl.bindTexture(gl.TEXTURE_2D,tx)
  gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR)
  gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE)
  gl.texImage2D(gl.TEXTURE_2D,0,gl.RGB,gl.RGB,gl.UNSIGNED_BYTE,im);gl.uniform1i(loc(id==='singapore'?'sg':id),i);boxes[id]=plate.bbox
 }
 gl.uniform4fv(loc('rb'),boxes.region);gl.uniform4fv(loc('mb'),boxes.metro);gl.uniform4fv(loc('sb'),boxes.singapore)
 return (cam,state)=>{gl.viewport(0,0,1920,1080);for(const [key,val] of [['C',cam.pos],['F',cam.forward],['E',cam.right],['N',cam.up]])gl.uniform3fv(loc(key),val)
  gl.uniform1f(loc('cc'),cam.c);gl.uniform1f(loc('focal'),cam.f);gl.uniform2fv(loc('shift'),[cam.sx,cam.sy]);gl.uniform1f(loc('grade'),state.grade)
  gl.uniform1f(loc('time'),state.time);gl.uniform2fv(loc('focus'),state.focus||[103.86,1.28]);gl.uniform1f(loc('colourRadius'),state.colourRadius||0);gl.drawArrays(gl.TRIANGLES,0,6)
 }
}
