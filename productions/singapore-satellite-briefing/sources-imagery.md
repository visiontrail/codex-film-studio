# Imagery provenance

These images establish geographic context. They are dated satellite composites, not live observations and not evidence of current construction, opening hours or transport service. The travel claims have their own source ledger.

| Plate | Coverage / pixels | Source period | Source and terms |
|---|---|---|---|
| `assets/plates/world.jpg` | Worldwide, EPSG:4326; 4096 × 2048 | 2004 Blue Marble Next Generation | NASA GIBS, `BlueMarble_NextGeneration`; NASA imagery use policy |
| `assets/plates/region.jpg` | 90°E–120°E, 10°S–20°N; 4096 × 4096 | 2004 Blue Marble Next Generation | NASA GIBS, same layer |
| `assets/plates/metro.jpg` | 102°E–105°E, 0°–3°N; 4096 × 4096 | **2016 historical mosaic** | EOX `s2cloudless`, **CC BY 4.0**; middle scale for seamless regional-to-city camera travel |
| `assets/plates/singapore.jpg` | 103.55°E–104.10°E, 1.15°N–1.50°N; 6000 × 3818 | **2016 historical mosaic** | EOX `s2cloudless`, **CC BY 4.0**; contains modified Copernicus Sentinel data 2016 |

The full-resolution plate is about 10 m per pixel. Enlarging it does not create building-level or street-level evidence. Modern travel footage is a separate source and must not be described as the same acquisition as the 2016 satellite mosaic.

The metropolitan plate is approximately 81 m per pixel at the equator. All four plates were opened and visually checked after assembly. The EOX source mosaic includes visible acquisition/compositing patches in water; these are retained source characteristics, not invented terrain or unfilled downloaded tiles. Scale-dependent blending and the film's neutral analysis grade reduce their prominence.

## Attribution in the film

For the Singapore plate, display a readable credit equivalent to:

> 卫星底图 2016 · Sentinel-2 / EOX · CC BY 4.0

The complete credit retained here is: Sentinel-2 cloudless 2016 by EOX IT Services GmbH. Contains modified Copernicus Sentinel data 2016. Licensed under [Creative Commons Attribution 4.0 International](https://creativecommons.org/licenses/by/4.0/). The imagery is reprojected, stitched, encoded as JPEG, and graded for this film.

For the orbit and regional plates: NASA Blue Marble / NASA GIBS. We acknowledge the imagery provided by NASA's Global Imagery Browse Services, part of NASA's Earth Science Data and Information System.

## Verification sources

- [EOX WMS capabilities](https://tiles.maps.eox.at/wms?service=wms&request=getcapabilities): the `s2cloudless` layer specifically identifies **2016** and **CC BY 4.0**. This must not be confused with later cloudless layers using different terms. A local snapshot and extracted layer entry are in `assets/raw/eox-wms-capabilities.xml` and `assets/raw/eox-2016-license.json`.
- [NASA Blue Marble: Next Generation](https://science.nasa.gov/earth/earth-observatory/blue-marble-next-generation/): the product is a series of true-colour monthly composites from **2004**, with 500 m source resolution.
- [NASA Worldview layer](https://worldview.earthdata.nasa.gov/?l=BlueMarble_NextGeneration&lg=false): the static layer is labelled Blue Marble (August 2004).
- [NASA imagery guidelines](https://www.nasa.gov/nasa-brand-center/images-and-media/): terms for NASA media use and acknowledgement.
- [NASA GIBS WMS](https://gibs.earthdata.nasa.gov/wms/epsg4326/best/wms.cgi): source service.

## Reproduction and audit

Run `.venv/bin/python scripts/fetch_plates.py` from this film directory. The script requests tiled JPEGs, validates their dimensions and image content, assembles them without invented fill, and records exact request URLs and SHA-256 hashes in `assets/raw/imagery-requests.jsonl`. The film-facing manifest is `content/imagery.json`.

WMS 1.3.0 with EPSG:4326 uses latitude/longitude axis order in NASA requests. EOX WMS 1.1.1 uses longitude/latitude. The output manifest consistently uses `[west, south, east, north]`.

No generative imagery, Google/Apple/Bing/Esri basemap, or current-observation claim is used for these ground plates.


## Printed-map land silhouette

The paper-map transition uses actual [Natural Earth 1:10m Land polygons](https://www.naturalearthdata.com/downloads/10m-physical-vectors/10m-land/), version 5.1.1, released in the [public domain](https://www.naturalearthdata.com/about/terms-of-use/). The official [S3 archive](https://naturalearth.s3.amazonaws.com/10m_physical/ne_10m_land.zip) and [NACIS mirror](https://naciscdn.org/naturalearth/10m/physical/ne_10m_land.zip) supplied identical validated byte ranges; the assembled ZIP passed every member CRC.

`content/coastline.json` is a WGS 84 MultiPolygon with longitude first. It is clipped to 98–108° E / 3° S–6° N, unioned to remove source polygon seams, then simplified with topology preservation at 0.0008 degrees and rounded to six decimals. It contains 151 polygons and 4,242 vertices, including Singapore's main island and surrounding islands present in the source. No coastlines were hand-drawn. Straight edges exactly on the bounding box are crop boundaries.

This is a generalized historical geographic illustration for the brief paper-map transition; it does not establish current reclamation, legal borders, or street-level shoreline precision. Regional and Singapore-detail previews were checked; the main-island land control point and Singapore Strait water control point passed.

- Raw ZIP: `assets/raw/ignored/ne_10m_land.zip`; SHA-256 `e547d749445eaa0964aba76738090ec88f5e63c4585122170f98c67a7ea922dc`.
- Derived GeoJSON: SHA-256 `3db2585a0d62937edae126d712692cd878b1bd0bc14d9ca5ff00e9eb8a3d00dd`; 94,742 bytes.
- Reproducible extraction: `.venv/bin/python -B scripts/extract_coastline.py` (pyshp 3.1.6; Shapely 2.2.0).
- Preview and extraction provenance remain with the ignored raw archive.
