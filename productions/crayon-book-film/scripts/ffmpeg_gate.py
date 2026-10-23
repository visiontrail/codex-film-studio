"""Serialize encoders and wait for existing FFmpeg jobs without touching them."""
from contextlib import contextmanager
import fcntl
from pathlib import Path
import subprocess
import sys
import time


@contextmanager
def gate():
    # Same lock as the other active studio production. A process-table check
    # also covers jobs that do not cooperate with this advisory lock.
    with open('/tmp/codex-film-ffmpeg.lock', 'a') as lock:
        fcntl.flock(lock, fcntl.LOCK_EX)
        while True:
            rows = subprocess.check_output(['ps', '-axo', 'pid=,comm='], text=True)
            busy = [r.split()[0] for r in rows.splitlines()
                    if len(r.split(None, 1)) == 2
                    and Path(r.split(None, 1)[1]).name == 'ffmpeg']
            if not busy:
                break
            print('Waiting for other FFmpeg jobs: ' + ', '.join(busy), flush=True, file=sys.stderr)
            time.sleep(5)
        yield


if __name__ == '__main__':
    with gate():
        raise SystemExit(subprocess.call(['/opt/homebrew/bin/ffmpeg', *sys.argv[1:]]))
