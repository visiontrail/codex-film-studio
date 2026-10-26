"""Check crawler-visible HTML, language routes and canonical deployment URLs."""
from html.parser import HTMLParser
import json
from pathlib import Path
import shutil
import tempfile
import unittest
from urllib.parse import urlsplit
import xml.etree.ElementTree as ET

from build_search import ROOT, build_search, site_base, metadata


class Document(HTMLParser):
    def __init__(self, text):
        super().__init__(); self.tags=[]; self.text=[]; self.json=[]; self.in_json=False
        self.feed(text)

    def handle_starttag(self,tag,attrs):
        attrs=dict(attrs); self.tags.append((tag,attrs))
        if tag=='script' and attrs.get('type')=='application/ld+json': self.in_json=True

    def handle_endtag(self,tag):
        if tag=='script': self.in_json=False

    def handle_data(self,data):
        if self.in_json: self.json.append(json.loads(data))
        else: self.text.append(data)

    def attrs(self,tag,**filters):
        return [attrs for name,attrs in self.tags if name==tag and all(attrs.get(k)==v for k,v in filters.items())]


class SearchTests(unittest.TestCase):
    def make_site(self,output,origin,path):
        catalog=json.loads((ROOT/'styles.json').read_text())
        shutil.copyfile(ROOT/'index.html',output/'index.html')
        (output/'catalog').mkdir()
        shutil.copyfile(ROOT/'catalog/studio.mjs',output/'catalog/studio.mjs')
        for s in catalog['styles']:
            pages={p['page'] for p in s.get('showcases',[]) if p['access']=='release'}
            if s.get('landing'): pages.add(s['landing']['page'])
            pages.add(f"styles/{s['id']}/showcase/_assets/internal.html")
            for name in pages:
                p=output/name; p.parent.mkdir(parents=True,exist_ok=True)
                p.write_text('<html><head><title>A sample</title><meta name="description" content="A real sample."></head><body><h1>A sample</h1></body></html>')
        build_search(output,catalog,origin,path,'test-revision')
        return catalog

    def test_static_language_pages_and_sitemap_under_root_and_project_path(self):
        for prefix in ['/', '/codex-film-studio/']:
            with self.subTest(prefix=prefix),tempfile.TemporaryDirectory() as directory:
                out=Path(directory); base='https://films.example'+prefix
                catalog=self.make_site(out,'https://films.example',prefix)
                ns={'s':'http://www.sitemaps.org/schemas/sitemap/0.9'}
                urls=[n.text for n in ET.parse(out/'sitemap.xml').findall('s:url/s:loc',ns)]
                self.assertEqual(len(urls),len(set(urls)))
                self.assertFalse(any('_assets' in u or '?' in u or '#' in u or '404' in u for u in urls))
                for u in urls:
                    self.assertTrue(u.startswith(base),u)
                    target=out/u[len(base):]; target=target/'index.html' if u.endswith('/') else target
                    self.assertTrue(target.is_file(),u)
                    doc=Document(target.read_text())
                    self.assertEqual([a['href'] for a in doc.attrs('link',rel='canonical')],[u])
                    self.assertEqual(len(doc.attrs('meta',name='description')),1)
                    self.assertNotIn('noindex',doc.attrs('meta',name='robots')[0]['content'])
                    self.assertEqual(doc.attrs('meta',property='og:url')[0]['content'],u)
                for lang in ['en','zh']:
                    home=base+('zh/' if lang=='zh' else '')
                    homepage=out/('zh/index.html' if lang=='zh' else 'index.html')
                    doc=Document(homepage.read_text())
                    self.assertEqual(len(doc.attrs('h1')),1)
                    self.assertEqual(doc.attrs('html')[0]['data-site-root'],prefix)
                    self.assertEqual(doc.attrs('html')[0]['lang'],'zh-CN' if lang=='zh' else 'en')
                    text=' '.join(doc.text)
                    self.assertNotIn('Opening the collection',text)
                    self.assertNotIn('正在打开风格片库',text)
                    self.assertIn('如何用 Codex' if lang=='zh' else 'How do you make a video',text)
                    graph=doc.json[0]['@graph']; listing=next(n for n in graph if n['@type']=='CollectionPage')['mainEntity']
                    self.assertEqual(len(listing['itemListElement']),len(catalog['styles']))
                    for style in catalog['styles']:
                        url=home+f"styles/{style['id']}/"
                        self.assertIn(url,[a['href'] for a in doc.attrs('a')])
                        target=out/url[len(base):]/'index.html'; guide=Document(target.read_text())
                        self.assertEqual(len(guide.attrs('h1')),1)
                        self.assertGreater(len(' '.join(guide.text)),600)
                        self.assertIn(style['guide'],' '.join(a.get('href','') for a in guide.attrs('a')))
                        self.assertEqual(guide.attrs('link',rel='alternate',hreflang='zh-CN')[0]['href'],base+'zh/styles/'+style['id']+'/')
                        self.assertEqual(guide.attrs('link',rel='alternate',hreflang='en')[0]['href'],base+'styles/'+style['id']+'/')
                        self.assertFalse(guide.attrs('script',type='module'))
                        self.assertNotIn('127.0.0.1',target.read_text())
                    for attr in doc.attrs('link',rel='alternate'):
                        self.assertIn(attr['href'],urls)
                private=Document((out/'styles/whiteboard/showcase/_assets/internal.html').read_text())
                self.assertIn('noindex',private.attrs('meta',name='robots')[0]['content'])
                self.assertIn(base+'sitemap.xml',(out/'robots.txt').read_text())
                self.assertIn('OAI-SearchBot',(out/'robots.txt').read_text())
                self.assertIn('noindex',(out/'404.html').read_text())
                self.assertIn("strings.mjs?v=test-revision",(out/'catalog/studio.mjs').read_text())

    def test_legacy_implicit_heads_keep_media_and_gain_head_metadata(self):
        for name in ['crayon-book/showcase/index.html', 'midcentury-cartoon/showcase/motion.html',
                     'satellite-briefing/showcase/comparison.html', 'scifi-sitcom/showcase/index.html']:
            with self.subTest(name=name):
                source=(ROOT/'styles'/name).read_text()
                before=Document(source)
                result=metadata(source,'A title','A description','https://films.example/sample/',
                                'https://films.example/image.jpg')
                after=Document(result)
                self.assertEqual(len(after.attrs('head')),1)
                self.assertEqual(len(after.attrs('body')),1)
                self.assertEqual(after.attrs('base'),before.attrs('base'))
                self.assertEqual(after.attrs('video'),before.attrs('video'))
                self.assertEqual(after.attrs('script'),before.attrs('script'))
                self.assertEqual(len(after.attrs('meta',name='description')),1)
                self.assertLess(result.index('rel="canonical"'),result.index('</head>'))
                self.assertLess(result.index('</head>'),result.index('<body>'))

    def test_origin_rejects_ambiguous_canonical_configuration(self):
        for origin in ['example.com','https://films.example/other','https://films.example?x=y','ftp://films.example']:
            with self.subTest(origin=origin),self.assertRaises(ValueError): site_base(origin,'/')


if __name__=='__main__': unittest.main()
