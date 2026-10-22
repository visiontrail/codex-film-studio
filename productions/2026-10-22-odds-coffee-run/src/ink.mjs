// Original screen-space ink renderer. All filled outlines share the same three-drawing boil.
export const INK='#1b1422', WHITE='#fffaf0';
export const clamp=(x,a=0,b=1)=>Math.min(b,Math.max(a,x));
export const ease=x=>{x=clamp(x);return x*x*(3-2*x)};
export class Ink {
 constructor(ctx,frame){this.c=ctx;this.frame=frame;this.phase=Math.floor(frame/2)%3;this.m=[1,0,0,1,0,0];this.stack=[]}
 push(x=0,y=0,sx=1,sy=sx,a=0){this.stack.push([...this.m]);let [A,B,C,D,E,F]=this.m,c=Math.cos(a),s=Math.sin(a);this.m=[(A*c+C*s)*sx,(B*c+D*s)*sx,(-A*s+C*c)*sy,(-B*s+D*c)*sy,A*x+C*y+E,B*x+D*y+F]}
 pop(){this.m=this.stack.pop()}
 point([x,y]){let[a,b,c,d,e,f]=this.m;return[a*x+c*y+e,b*x+d*y+f]}
 poly(points,fill=null,stroke=INK,width=7,closed=true,boil=1){
  let pts=points.map(p=>this.point(p));if(!pts.length)return;let arr=[],dist=0,seed=(pts[0][0]*.007+pts[0][1]*.011);
  for(let i=0;i<pts.length-(closed?0:1);i++){let a=pts[i],b=pts[(i+1)%pts.length],dx=b[0]-a[0],dy=b[1]-a[1],len=Math.hypot(dx,dy),n=Math.max(1,Math.ceil(len/9));
   for(let j=0;j<n;j++){let t=j/n,arc=dist+len*t;let jitter=boil*(1.15*Math.sin(arc*.053+this.phase*2.1+seed)+.45*Math.sin(arc*.13+this.phase*3.2));arr.push([a[0]+dx*t-dy/(len||1)*jitter,a[1]+dy*t+dx/(len||1)*jitter]);}dist+=len}
  if(!closed)arr.push(pts.at(-1));let c=this.c;c.beginPath();arr.forEach((p,i)=>i?c.lineTo(...p):c.moveTo(...p));if(closed)c.closePath();if(fill){c.fillStyle=fill;c.fill()}if(stroke&&width){c.strokeStyle=stroke;c.lineWidth=width;c.lineJoin='round';c.lineCap='round';c.stroke()}
 }
 line(pts,color=INK,width=5){this.poly(pts,null,color,width,false)}
 curve(p,fill=null,stroke=INK,width=7,closed=false){let pts=[p[0]],start=p[0];for(let k=1;k<p.length;k+=3){let a=p[k],b=p[k+1],e=p[k+2];for(let i=1;i<=24;i++){let t=i/24,u=1-t;pts.push([u*u*u*start[0]+3*u*u*t*a[0]+3*u*t*t*b[0]+t*t*t*e[0],u*u*u*start[1]+3*u*u*t*a[1]+3*u*t*t*b[1]+t*t*t*e[1]])}start=e}this.poly(pts,fill,stroke,width,closed)}
 ellipse(x,y,rx,ry,fill,stroke=INK,width=7){let pts=Array.from({length:64},(_,i)=>{let a=i/64*Math.PI*2;return[x+Math.cos(a)*rx,y+Math.sin(a)*ry]});this.poly(pts,fill,stroke,width)}
 rect(x,y,w,h,fill,stroke=INK,width=7,r=0){if(!r){this.poly([[x,y],[x+w,y],[x+w,y+h],[x,y+h]],fill,stroke,width);return}let pts=[];for(let [cx,cy,start] of [[x+w-r,y+r,-Math.PI/2],[x+w-r,y+h-r,0],[x+r,y+h-r,Math.PI/2],[x+r,y+r,Math.PI]])for(let i=0;i<=8;i++){let a=start+i/8*Math.PI/2;pts.push([cx+r*Math.cos(a),cy+r*Math.sin(a)])}this.poly(pts,fill,stroke,width)}
 text(s,x,y,size=40,color=WHITE,{font='Baloo',align='center',stroke=null,width=7,weight='800'}={}){let c=this.c,[a,b,cc,d,e,f]=this.m;c.save();c.setTransform(a,b,cc,d,e,f);c.font=`${weight} ${size}px "${font}"`;c.textAlign=align;c.textBaseline='middle';c.lineJoin='round';if(stroke){c.strokeStyle=stroke;c.lineWidth=width/Math.sqrt(Math.abs(a*d-b*cc));c.strokeText(s,x,y)}c.fillStyle=color;c.fillText(s,x,y);c.restore()}
 star(x,y,r,fill='#f8d674',n=5,stroke=INK,width=3){let pts=[];for(let i=0;i<n*2;i++){let a=i*Math.PI/n-Math.PI/2,rr=i%2?r*.42:r;pts.push([x+Math.cos(a)*rr,y+Math.sin(a)*rr])}this.poly(pts,fill,stroke,width)}
}
