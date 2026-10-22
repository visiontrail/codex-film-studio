"""Local review server with byte ranges for reliable media seeking."""
import http.server,os,re,argparse
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
class Handler(http.server.SimpleHTTPRequestHandler):
 def send_head(self):
  path=self.translate_path(self.path)
  if self.headers.get('Range') and os.path.isfile(path):
   size=os.path.getsize(path);m=re.fullmatch(r'bytes=(\d+)-(\d*)',self.headers['Range'])
   if m:
    first=int(m[1]);last=min(size-1,int(m[2]) if m[2] else size-1)
    if first>last:self.send_error(416);return
    f=open(path,'rb');f.seek(first);self.send_response(206);self.send_header('Content-Type',self.guess_type(path));self.send_header('Content-Range',f'bytes {first}-{last}/{size}');self.send_header('Content-Length',last-first+1);self.send_header('Accept-Ranges','bytes');self.end_headers();self.remaining=last-first+1;return f
  self.remaining=None;return super().send_head()
 def copyfile(self,source,output):
  if self.remaining is None:return super().copyfile(source,output)
  while self.remaining:
   data=source.read(min(self.remaining,1024*1024))
   if not data:break
   try:output.write(data)
   except (BrokenPipeError,ConnectionResetError):break
   self.remaining-=len(data)
p=argparse.ArgumentParser();p.add_argument('--port',type=int,default=8736);a=p.parse_args();os.chdir(ROOT)
print(f'Review: http://127.0.0.1:{a.port}/review.html',flush=True);http.server.ThreadingHTTPServer(('127.0.0.1',a.port),Handler).serve_forever()
