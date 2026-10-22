"""Serialize this film's FFmpeg work; wait for any existing external FFmpeg."""
import contextlib, fcntl, json, os, subprocess, time
from pathlib import Path
LOCK=Path('/tmp/codex-film-studio-ffmpeg.lock')
@contextlib.contextmanager
def ffmpeg_slot():
 with LOCK.open('a+') as lock:
  fcntl.flock(lock,fcntl.LOCK_EX)
  previous=None
  while True:
   check=subprocess.run(['pgrep','-x','ffmpeg'],capture_output=True,text=True)
   running=[int(x) for x in check.stdout.split()]
   if not running:break
   if running!=previous: print('Waiting for other FFmpeg processes:',running,flush=True);previous=running
   time.sleep(5)
  try:yield
  finally:fcntl.flock(lock,fcntl.LOCK_UN)
def run(args,**kw):
 with ffmpeg_slot():return subprocess.run(['ffmpeg',*args],**kw)
if __name__=='__main__':
 import sys
 with ffmpeg_slot():raise SystemExit(subprocess.call(sys.argv[1:]))
