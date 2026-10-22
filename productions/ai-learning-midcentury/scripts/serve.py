"""Local-only review server with byte-range support for video seeking."""
import argparse
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
import re
import shutil

ROOT=Path(__file__).resolve().parents[1]
class Handler(SimpleHTTPRequestHandler):
    def __init__(self,*args,**kw):super().__init__(*args,directory=str(ROOT),**kw)
    def send_head(self):
        path=Path(self.translate_path(self.path))
        if not path.is_file() or 'Range' not in self.headers:return super().send_head()
        m=re.fullmatch(r'bytes=(\d*)-(\d*)',self.headers['Range'])
        if not m:self.send_error(416);return None
        size=path.stat().st_size
        if m[1]:start=int(m[1]);end=min(int(m[2]) if m[2] else size-1,size-1)
        else:start=max(0,size-int(m[2]));end=size-1
        if start> end or start>=size:self.send_error(416);return None
        self.send_response(206);self.send_header('Content-Type',self.guess_type(str(path)));self.send_header('Content-Length',str(end-start+1));self.send_header('Content-Range',f'bytes {start}-{end}/{size}');self.send_header('Accept-Ranges','bytes');self.end_headers()
        f=path.open('rb');f.seek(start);self._range_remaining=end-start+1;return f
    def copyfile(self,source,outputfile):
        if not hasattr(self,'_range_remaining'):return shutil.copyfileobj(source,outputfile)
        remaining=self._range_remaining;del self._range_remaining
        while remaining:
            b=source.read(min(65536,remaining))
            if not b:break
            outputfile.write(b);remaining-=len(b)
    def log_message(self,*args):pass
if __name__=='__main__':
    p=argparse.ArgumentParser();p.add_argument('--port',type=int,default=8776);a=p.parse_args()
    print(f'http://127.0.0.1:{a.port}/',flush=True)
    ThreadingHTTPServer(('127.0.0.1',a.port),Handler).serve_forever()
