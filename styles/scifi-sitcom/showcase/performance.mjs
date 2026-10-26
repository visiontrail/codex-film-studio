// Generic expression study: original neutral figures, no production cast or story.
import {Ink, INK} from '../starter/lib/ink.mjs';

const palette = {paper:'#fff3d9',mint:'#b8d995',coral:'#ed967d',lilac:'#b3a1cf',yellow:'#f5d36c'};
export function drawPerformance(canvas, seconds = 0) {
  const c = canvas.getContext('2d');
  if (!c) return;
  const frame = Math.floor(Math.max(0, Math.min(6, seconds)) * 24);
  const beat = seconds < 2 ? 0 : seconds < 4 ? 1 : 2;
  const i = new Ink(c, frame);
  const shape = (points,fill,extra={}) => i.poly(points,{fill,width:6,roughness:1.15,...extra});
  const line = (points,width=5) => i.poly(points,{closed:false,width,roughness:.6});
  const ellipse = (x,y,rx,ry,fill,extra={}) => i.ellipse(x,y,rx,ry,{fill,width:6,roughness:.8,...extra});
  c.fillStyle=palette.lilac;c.fillRect(0,0,1200,540);
  shape([[0,0],[600,0],[582,540],[0,540]],palette.mint,{stroke:null});
  shape([[600,0],[1200,0],[1200,540],[582,540]],palette.coral,{stroke:null});
  // Flat background forms keep the eye on the performance.
  line([[600,0],[582,540]],4);
  for (const [x,y,s] of [[80,92,17],[505,100,22],[710,70,14],[1110,145,25]]) {
    shape([[x,y-s],[x+4,y-4],[x+s,y],[x+4,y+4],[x,y+s],[x-4,y+4],[x-s,y],[x-4,y-4]],palette.paper,{width:3});
  }
  ellipse(290,430,177,22,'#89b777',{stroke:null});ellipse(902,430,177,22,'#c77b76',{stroke:null});

  function eye(x,y,rx,ry,skin,{half=false,pupilY=4,pupilX=9,tiny=false}={}) {
    ellipse(x,y,rx,ry,palette.paper,{width:5});
    ellipse(x+pupilX,y+pupilY,tiny?4:7,tiny?6:10,INK,{stroke:null});
    if (half) {
      const lid = Array.from({length:25},(_,n)=>{const a=Math.PI+n/24*Math.PI;return [x+Math.cos(a)*rx,y+Math.sin(a)*ry]});
      shape(lid,skin,{width:4,roughness:.4});
    }
  }
  // Calm: a tall rounded silhouette and restrained lids.
  i.push(290,292,1,1,0);
  shape([[-93,70],[-69,10],[57,10],[98,70],[112,139],[-108,139]],'#8a76ab');
  shape([[45,18],[58,20],[98,70],[112,139],[64,139]],'#6d5c8c',{stroke:null});
  line([[-70,69],[-66,115],[62,115],[68,70]]);
  shape([[-76,80],[-62,110],[60,95],[60,119],[-67,137],[-93,111]],palette.mint);
  ellipse(65,107,15,13,palette.mint,{width:4});
  shape([[-66,-125],[-45,-147],[48,-143],[74,-113],[81,-13],[65,21],[23,44],[-47,35],[-76,7],[-83,-77]],palette.mint);
  shape([[49,-141],[74,-113],[81,-13],[65,21],[23,44],[36,17],[54,-3],[58,-91]],'#87b676',{stroke:null});
  line([[-11,-143],[-18,-176],[1,-188]],4);ellipse(6,-187,11,10,palette.yellow,{width:4});
  eye(-34,-60,31,40,palette.mint,{half:true,pupilY:15,pupilX:10});
  eye(30,-60,31,40,palette.mint,{half:true,pupilY:15,pupilX:7});
  line([[-59,-110],[-12,-105]],5);line([[11,-104],[54,-109]],5);
  line([[-6,-42],[-14,-10],[2,-8]],4);line([[-25,11],[20,13],[29,8]],4);
  i.pop();

  // Escalating: rounder eyes, a compact angular silhouette, then raised hands.
  // Each reaction settles into a fixed pose; no perpetual body bob.
  i.push(900,292,1,1,beat===1 ? -.06 : 0);
  shape([[-81,50],[-58,11],[48,11],[86,58],[109,139],[-103,139]],palette.yellow);
  shape([[49,24],[86,58],[109,139],[72,139],[63,74]],'#d5a74e',{stroke:null});
  line([[-51,45],[-25,72],[0,40],[28,72],[52,45]],4);
  if(beat===2) {
    shape([[-77,61],[-112,26],[-136,-27],[-160,-12],[-137,53],[-99,99]],palette.coral);
    shape([[75,61],[108,27],[130,-32],[155,-14],[134,53],[96,99]],palette.coral);
    ellipse(-148,-31,22,24,palette.coral,{width:5});ellipse(144,-33,22,24,palette.coral,{width:5});
    line([[-158,-33],[-174,-65]],4);line([[-149,-43],[-154,-78]],4);line([[-139,-40],[-137,-69]],4);
    line([[132,-40],[128,-72]],4);line([[144,-47],[147,-83]],4);line([[155,-34],[173,-64]],4);
  } else {
    shape([[-76,52],[-89,110],[-67,138],[-49,120],[-52,72]],palette.coral);
    shape([[75,52],[89,110],[67,138],[49,120],[52,72]],palette.coral);
  }
  shape([[-78,-113],[-51,-153],[-18,-136],[16,-159],[45,-134],[76,-119],[93,-67],[78,0],[41,40],[-30,45],[-71,15],[-93,-48]],palette.coral);
  shape([[76,-119],[93,-67],[78,0],[41,40],[10,44],[46,8],[67,-57]],'#d77663',{stroke:null});
  const wide=beat===0?32:beat===1?39:43;
  eye(-38,-63,wide,beat===0?38:48,palette.coral,{pupilX:beat===0?-5:-10,pupilY:beat===0?7:0,tiny:beat===2});
  eye(38,-63,wide,beat===0?38:48,palette.coral,{pupilX:beat===0?-5:-10,pupilY:beat===0?7:0,tiny:beat===2});
  if(beat===0){line([[-60,-113],[-20,-109]],4);line([[18,-109],[58,-113]],4);line([[-24,12],[22,12]],4);}
  else if(beat===1){line([[-67,-122],[-25,-130]],5);line([[22,-131],[64,-122]],5);ellipse(0,12,13,17,INK,{width:4});}
  else {
    line([[-72,-127],[-29,-143]],5);line([[29,-145],[72,-130]],5);
    ellipse(0,8,32,26,INK,{width:4});
    shape([[-22,22],[-10,12],[10,12],[24,22],[13,28],[-11,29]],'#ec8e9d',{stroke:null,roughness:.2});
    for(const [x,y,dx,dy] of [[-121,-112,-22,-15],[119,-113,25,-13],[-80,-164,-9,-22],[93,-159,12,-23]])line([[x,y],[x+dx,y+dy]],5);
  }
  i.pop();
}
