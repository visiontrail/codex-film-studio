"""Independent transcription check; does not claim a human listening review."""
import json
from pathlib import Path
from scipy.io import wavfile
import numpy as np
from scipy.signal import resample_poly
import mlx_whisper
ROOT=Path(__file__).resolve().parents[1]
sr,a=wavfile.read(ROOT/'media/narration.wav');a=resample_poly(a.astype(np.float32)/2147483648,16000,sr).astype(np.float32)
r=mlx_whisper.transcribe(a,path_or_hf_repo='mlx-community/whisper-small-mlx',language='en',word_timestamps=True,verbose=False)
(ROOT/'review/narration-asr.json').write_text(json.dumps(r,indent=2))
print(r['text'])
