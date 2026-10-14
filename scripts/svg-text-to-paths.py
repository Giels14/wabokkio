"""Zet <text> in de logo-SVG's om naar <path> (Nunito 800 / Inter 400), zodat het logo als <img> correct rendert.
Gebruik: python svg-text-to-paths.py in.svg out.svg [mark-vector.svg]
Met een derde argument wordt de ingesloten raster-pinguïn (<image>) vervangen door de vector-mark.   (vereist fonttools, brotli, uharfbuzz)"""
import re, sys, io
from fontTools.ttLib import TTFont
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen
import uharfbuzz as hb
FS = 'node_modules/@fontsource-variable/'
FONTS = {'Nunito': FS + 'nunito/files/nunito-latin-wght-normal.woff2', 'Inter': FS + 'inter/files/inter-latin-wght-normal.woff2'}

def to_path(text, family, weight, size, x0, y0, anchor='start'):
    f = TTFont(FONTS[family]); f.flavor = None
    buf = io.BytesIO(); f.save(buf); data = buf.getvalue()
    face = hb.Face(data); font = hb.Font(face); font.set_variations({'wght': weight})
    b = hb.Buffer(); b.add_str(text); b.guess_segment_properties(); hb.shape(font, b, {'kern': True, 'liga': True})
    upem = f['head'].unitsPerEm; s = size / upem
    gs = f.getGlyphSet(location={'wght': weight}); order = f.getGlyphOrder()
    pen = SVGPathPen(gs, ntos=lambda v: ('%.2f' % v).rstrip('0').rstrip('.'))
    total = sum(p.x_advance for p in b.glyph_positions) * s
    x0 -= {'middle': total / 2, 'end': total}.get(anchor, 0)
    x = 0
    for info, pos in zip(b.glyph_infos, b.glyph_positions):
        g = gs[order[info.codepoint]]
        g.draw(TransformPen(pen, (s, 0, 0, -s, x0 + (x + pos.x_offset) * s, y0 - pos.y_offset * s)))
        x += pos.x_advance
    return pen.getCommands()

src = open(sys.argv[1]).read()
def repl(m):
    attrs, text = m.group(1), m.group(2)
    a = dict(re.findall(r'([\w-]+)="([^"]*)"', attrs))
    fam = 'Nunito' if 'Nunito' in a['font-family'] else 'Inter'
    d = to_path(text, fam, int(a.get('font-weight', 400)), float(a['font-size']), float(a['x']), float(a['y']), a.get('text-anchor', 'start'))
    return f'<path aria-label="{text}" fill="{a["fill"]}" d="{d}"/>'
out = re.sub(r'<text([^>]*)>([^<]*)</text>', repl, src)
if len(sys.argv) > 3:
    mv = open(sys.argv[3]).read()
    vb = re.search(r'viewBox="([^"]*)"', mv).group(1)
    inner = re.sub(r'^.*?<svg[^>]*>|</svg>\s*$', '', mv, flags=re.S).replace('id="g"', 'id="mk"').replace('url(#g)', 'url(#mk)')
    def img(m):
        a = dict(re.findall(r'([\w-]+)="([^"]*)"', re.sub(r'href="[^"]*"', '', m.group(0))))
        return f'<svg x="{a["x"]}" y="{a["y"]}" width="{a["width"]}" height="{a["height"]}" viewBox="{vb}">{inner}</svg>'
    out = re.sub(r'<image\b[^>]*/>', img, out, flags=re.S)
out = out.replace('<svg ', '<svg role="img" aria-label="Wabokkio" ', 1)
open(sys.argv[2], 'w').write(out)
