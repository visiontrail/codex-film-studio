import {line,rr,oval,path,text} from './primitives.mjs';

// Technical objects use contour, internal and hidden lines independently.
// Sizes are object-local; the scene can enlarge them without heavy icon rims.
export function blueprintObject(g,kind,p){
 const outer=1.05,inner=.65;
 const rect=(x,y,w,h,r=1)=>rr(g,x,y,w,h,r,p.paper,p.ink,outer);
 const edge=(pts,w=inner,c=p.ink)=>line(g,pts,c,w);
 const ellipse=(x,y,rx,ry)=>oval(g,x,y,rx,ry,p.paper,p.ink,outer);
 const hidden=fn=>{g.save();g.setLineDash([3,3]);g.globalAlpha=.6;fn();g.restore()};
 if(kind==='dough'){
  ellipse(0,0,47,20);edge([[-34,-2],[-16,-9],[12,-10],[34,-3]]);
  hidden(()=>edge([[-34,3],[-12,11],[17,10],[35,3]]));
 }else if(['soil','flour','compost'].includes(kind)){
  path(g,[[-38,22],[-29,-41],[23,-47],[39,21]],p.paper,p.ink,outer);
  edge([[-26,-40],[-19,-33],[23,-39],[23,-47]]);edge([[-33,16],[32,16]]);
  rr(g,-20,-20,40,25,1,null,p.ink,inner);text(g,kind==='flour'?'F':'S',0,-7,16,p.ink,null,0,'monospace');
  hidden(()=>edge([[-26,-33],[-22,14],[29,14],[22,-37]]));
 }else if(kind==='oven'){
  rect(-49,-51,98,91,3);rect(-38,-25,76,52,2);
  for(let y=-47;y<=-40;y+=3)edge([[-11,y],[11,y]]);
  ellipse(28,-39,6,6);ellipse(-28,-39,6,6);edge([[28,-39],[31,-42]],inner,p.accent);
  edge([[-24,-17],[24,-17]],1.2);edge([[-30,14],[30,14]]);
  hidden(()=>{edge([[-31,-9],[-31,20],[31,20],[31,-9]]);edge([[-39,34],[39,34]])});
  for(let x=-24;x<=24;x+=12)edge([[x,3],[x+4,-2],[x+8,3]]);
 }else if(kind==='sprinkler'){
  rect(-38,-55,76,63,2);rect(-27,-43,54,22);
  text(g,'06:00',0,-32,12,p.ink,null,0,'monospace');ellipse(-19,-7,4,4);ellipse(18,-7,4,4);
  edge([[0,8],[0,28],[43,28],[43,41]],2.2);edge([[-13,17],[13,17]],1.4,p.accent);
  edge([[43,41],[43,51],[23,63],[-35,63],[-56,48],[-56,30]],1.4);
  edge([[-67,28],[-45,28]],1.4);
  for(let i=0;i<5;i++)edge([[-56,25],[-78+i*11,-6-Math.sin(i/4*Math.PI)*20]],.7,p.accent);
  hidden(()=>edge([[-32,-49],[32,-49],[32,1],[-32,1],[-32,-49]]));
 }else if(['tray','fence'].includes(kind)){
  rect(-52,-26,104,53);
  path(g,[[-52,-26],[-31,-48],[71,-48],[52,-26]],p.paper,p.ink,outer);
  edge([[52,-26],[71,-48],[71,5],[52,27]],outer);
  if(kind==='tray'){
   edge([[-44,-30],[-28,-43],[57,-43],[44,-30],[-44,-30]]);
   hidden(()=>edge([[-44,-18],[44,-18],[44,19],[-44,19],[-44,-18]]));
  }else{
   for(let x=-36;x<48;x+=17)edge([[x,-22],[x,22]],.8);
   edge([[-48,-14],[48,-14]]);edge([[-48,13],[48,13]]);
  }
 }else return false;
 hidden(()=>edge([[-65,46],[65,46]]));edge([[-65,41],[-65,52]]);edge([[65,41],[65,52]]);
 text(g,'120',0,54,9,p.ink,null,0,'monospace');
 return true;
}
