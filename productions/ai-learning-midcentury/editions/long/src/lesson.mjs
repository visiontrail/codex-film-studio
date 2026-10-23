// Shared semantic state for the drawn balance. x = 4 throughout this example.
export function balanceState(mode, secondsAfterAction) {
  const u=Math.max(0,Math.min(1,secondsAfterAction/.65))
  const progress=u*u*(3-2*u)
  if(mode==='initial')return {progress:0,leftX:2,leftUnits:3,rightUnits:11,removeX:0,removeUnits:0,equation:'2x + 3 = 11'}
  if(mode==='subtract')return {progress,leftX:2,leftUnits:3,rightUnits:11,removeX:0,removeUnits:3,equation:u===0?'2x + 3 = 11':u===1?'2x = 8':'2x + 3 − 3 = 11 − 3'}
  if(mode==='divide')return {progress,leftX:2,leftUnits:0,rightUnits:8,removeX:1,removeUnits:4,equation:u===0?'2x = 8':u===1?'x = 4':'2x ÷ 2 = 8 ÷ 2'}
  throw Error('Unknown balance operation')
}
