"""Wait for the other film's FFmpeg, then hold the studio-wide encoder lock."""
import contextlib
import fcntl
import subprocess
import sys
import time


@contextlib.contextmanager
def slot():
    with open('/tmp/codex-film-studio-ffmpeg.lock', 'a+') as lock:
        fcntl.flock(lock, fcntl.LOCK_EX)
        last = None
        while True:
            pids = subprocess.run(['pgrep', '-x', 'ffmpeg'], capture_output=True, text=True).stdout.split()
            if not pids:
                break
            if pids != last:
                print('Waiting for existing FFmpeg:', ', '.join(pids), flush=True)
                last = pids
            time.sleep(3)
        try:
            yield
        finally:
            fcntl.flock(lock, fcntl.LOCK_UN)


if __name__ == '__main__':
    with slot():
        raise SystemExit(subprocess.call(sys.argv[1:]))
