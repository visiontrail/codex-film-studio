"""Download OFL faces, including a serif subset covering the English film."""
import pathlib
import re
import requests
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry

ROOT = pathlib.Path(__file__).resolve().parents[1]
OUT = ROOT / 'assets/fonts'
OUT.mkdir(parents=True, exist_ok=True)
BASE = 'https://raw.githubusercontent.com/google/fonts/main/ofl/'
session = requests.Session()
session.headers['User-Agent'] = 'Mozilla/5.0'
session.mount('https://', HTTPAdapter(max_retries=Retry(total=5,backoff_factor=1,status_forcelist=[429,500,502,503,504])))


def fetch(url, dest):
    response = session.get(url, timeout=90)
    response.raise_for_status()
    dest.write_bytes(response.content)


for folder, name in [('barlowcondensed', 'BarlowCondensed-Light.ttf'), ('barlowcondensed', 'BarlowCondensed-Regular.ttf'), ('ibmplexmono', 'IBMPlexMono-Regular.ttf')]:
    fetch(BASE + folder + '/' + name, OUT / name)
    fetch(BASE + folder + '/OFL.txt', OUT / ('OFL-' + folder + '.txt'))
chars = ''.join(chr(i) for i in range(32, 127)) + '°·→'
for family, filename, weight in [('Noto Sans SC', 'NotoSansSC.woff2',400), ('Noto Sans SC', 'NotoSansSC-Medium.woff2',500), ('Noto Serif SC', 'NotoSerifSC.woff2',600)]:
    response = session.get('https://fonts.googleapis.com/css2', params={'family': family + ':wght@'+str(weight), 'text': chars}, timeout=90)
    response.raise_for_status()
    url = re.search(r'url\((https://[^)]+)\)', response.text).group(1)
    fetch(url, OUT / filename)
    fetch(BASE + family.lower().replace(' ', '') + '/OFL.txt', OUT / ('OFL-' + family.lower().replace(' ', '') + '.txt'))
print('Downloaded fonts and OFL licenses.')
