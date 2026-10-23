import test from 'node:test';
import assert from 'node:assert/strict';
import {indexPixelBuffer,pixelPalette} from './materials.mjs';

test('indexed pixel output contains only palette colours and preserves alpha',()=>{
 const data=new Uint8ClampedArray(256*4);
 for(let i=0;i<256;i++)data.set([i,255-i,(i*37)%256,i],i*4);
 const g={canvas:{width:256,height:1},getImageData:()=>({data}),putImageData:()=>{}};
 indexPixelBuffer(g);
 for(let i=0;i<256;i++){
  const hex='#'+[...data.slice(i*4,i*4+3)].map(v=>v.toString(16).padStart(2,'0')).join('');
  assert.ok(pixelPalette.includes(hex));assert.equal(data[i*4+3],i);
 }
 const first=data.slice();indexPixelBuffer(g);assert.deepEqual(data,first);
});
