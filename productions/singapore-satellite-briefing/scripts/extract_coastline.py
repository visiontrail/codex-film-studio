from pathlib import Path
from io import BytesIO
import hashlib
import json
import zipfile

import shapefile
from shapely import make_valid
from shapely.geometry import box, shape, mapping, Point
from shapely.ops import unary_union
from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parents[1]
HERE = ROOT / 'assets/raw/ignored'
source = HERE / 'ne_10m_land.zip'
bbox = [98, -3, 108, 6]
clip = box(*bbox)
with zipfile.ZipFile(source) as archive:
    assert archive.testzip() is None, 'ZIP CRC failure'
    version = archive.read('ne_10m_land.VERSION.txt').decode().strip()
    reader = shapefile.Reader(shp=BytesIO(archive.read('ne_10m_land.shp')),
                              shx=BytesIO(archive.read('ne_10m_land.shx')),
                              dbf=BytesIO(archive.read('ne_10m_land.dbf')))
    selected = []
    for item in reader.shapes():
        if not box(*item.bbox).intersects(clip):
            continue
        geometry = make_valid(shape(item.__geo_interface__)).intersection(clip)
        if not geometry.is_empty:
            selected.append(geometry)

merged = unary_union(selected)
simple = merged.simplify(.0008, preserve_topology=True)
polygons = [simple] if simple.geom_type == 'Polygon' else list(simple.geoms)
polygons = [p for p in polygons if p.geom_type == 'Polygon']
polygons.sort(key=lambda p: p.area, reverse=True)
coords = [mapping(p)['coordinates'] for p in polygons]
def rounded(value):
    if isinstance(value, (list, tuple)):
        return [rounded(v) for v in value]
    return round(float(value), 6)

output = {'type': 'MultiPolygon', 'bbox': bbox, 'coordinates': rounded(coords),
          'source': {'title': 'Natural Earth 1:10m Land', 'version': version,
                     'scale': '1:10,000,000', 'license': 'Public domain',
                     'source_page': 'https://www.naturalearthdata.com/downloads/10m-physical-vectors/10m-land/',
                     'download_url': 'https://naturalearth.s3.amazonaws.com/10m_physical/ne_10m_land.zip',
                     'mirror_url': 'https://naciscdn.org/naturalearth/10m/physical/ne_10m_land.zip',
                     'license_url': 'https://www.naturalearthdata.com/about/terms-of-use/',
                     'raw_sha256': hashlib.sha256(source.read_bytes()).hexdigest(),
                     'processing': 'Physical land polygons clipped to bbox, unioned to remove source tile seams, topology-preserving simplification 0.0008 degrees, six decimal coordinates.',
                     'coordinate_order': 'longitude, latitude (WGS 84 / EPSG:4326)',
                     'purpose': 'Historical generalized geographic illustration; not current coastline, legal boundaries, or street-level geometry.',
                     'clip_edge_note': 'Straight segments at the bounding box are crop edges, not coastlines.'}}
check = shape(output)
assert check.is_valid
assert check.covers(Point(103.84, 1.35)), 'Singapore main island missing'
assert not check.covers(Point(103.86, 1.20)), 'Singapore Strait control point unexpectedly on land'
path = ROOT / 'content/coastline.json'
path.write_text(json.dumps(output, ensure_ascii=False, separators=(',', ':')) + '\n')

def preview(bounds, destination, width, height):
    left, bottom, right, top = bounds
    image = Image.new('RGB', (width, height + 40), '#cbd9db')
    draw = ImageDraw.Draw(image)
    def points(ring):
        return [((x-left)/(right-left)*width, 40+(top-y)/(top-bottom)*height) for x,y in ring]
    cropped = check.intersection(box(*bounds))
    parts = [cropped] if cropped.geom_type == 'Polygon' else list(cropped.geoms)
    for polygon in parts:
        if polygon.geom_type != 'Polygon':
            continue
        draw.polygon(points(polygon.exterior.coords), fill='#e8dfc8', outline='#625b4f')
        for interior in polygon.interiors:
            draw.polygon(points(interior.coords), fill='#cbd9db', outline='#625b4f')
    draw.rectangle((0,0,width,39), fill='#10151b')
    draw.text((12,13), f'Natural Earth {version} | WGS84 | {bounds} | generalized historical coastline', fill='white')
    image.save(destination)

preview(bbox, HERE/'coastline-region-preview.png', 1400, 1260)
preview([103.5,1.1,104.2,1.55], HERE/'coastline-singapore-preview.png', 1400, 900)
stats = {'version': version, 'polygons': len(polygons),
         'rings': sum(len(p) for p in coords),
         'vertices': sum(len(r) for p in coords for r in p),
         'bytes': path.stat().st_size, 'geometry_valid': check.is_valid,
         'singapore_main_island_control': True, 'strait_water_control': True,
         'output_sha256': hashlib.sha256(path.read_bytes()).hexdigest(),
         'source': output['source']}
(HERE/'coastline-provenance.json').write_text(json.dumps(stats, indent=2) + '\n')
print(json.dumps(stats, indent=2))
