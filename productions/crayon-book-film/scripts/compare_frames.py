"""Exhaustive bidirectional style-feature comparisons, never a similarity score."""
import csv,json
from pathlib import Path
import numpy as np
ROOT=Path(__file__).resolve().parents[1]
def read(p):
 with p.open() as f:return list(csv.DictReader(f))
r=read(ROOT/'review/reference/frames.csv');q=read(ROOT/'review/final/frames.csv')
print('reference keys',list(r[0]))
# Subject matter and shot scale vary; describe colour/material distributions,
# not structural/pixel similarity between unrelated drawings.
keys=[k for k in r[0] if k not in ['frame','time','sha256','frame_delta']]
keys=[k for k in keys if all(x.get(k,'').replace('.','',1).replace('-','',1).isdigit() for x in [r[0],q[0]])]
a=np.array([[float(x[k])for k in keys]for x in r]);b=np.array([[float(x[k])for k in keys]for x in q]);spread=np.maximum(a.std(0),.01)
nearest=[];distances=[]
for first in range(0,len(b),200):
 d=np.sqrt(np.mean(((b[first:first+200,None,:]-a[None,:,:])/spread)**2,axis=2));ix=d.argmin(1);nearest.extend(ix.tolist());distances.extend(d[np.arange(len(ix)),ix].tolist())
with (ROOT/'review/final/every-output-frame-comparison.csv').open('w') as f:
 w=csv.writer(f);w.writerow(['output_frame','reference_feature_neighbour','standardized_feature_distance']);w.writerows((i,j,float(d))for i,(j,d)in enumerate(zip(nearest,distances)))
with (ROOT/'review/final/every-reference-frame-comparison.csv').open('w') as f:
 w=csv.writer(f);w.writerow(['reference_frame','output_feature_neighbour','standardized_feature_distance'])
 for i,x in enumerate(a):
  d=np.sqrt(np.mean(((b-x)/spread)**2,axis=1));j=int(d.argmin());w.writerow([i,j,float(d[j])])
summary={'reference_frames':len(r),'output_frames':len(q),'reference_coverage':1,'output_coverage':1,'features':keys,'reference_feature_mean':dict(zip(keys,a.mean(0).tolist())),'output_feature_mean':dict(zip(keys,b.mean(0).tolist())),'median_nearest_feature_distance':float(np.median(distances)),'interpretation':'Exhaustive numerical material/colour distribution comparison. Not a perceptual similarity percentage, not pixel equivalence, not a substitute for image inspection.'}
(ROOT/'review/final/comparison-summary.json').write_text(json.dumps(summary,indent=2))
print(json.dumps(summary,indent=2))
