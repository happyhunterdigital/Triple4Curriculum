# CMYK print bundle

DeviceCMYK versions of every PDF in `../`. Same trim sizes, same page counts,
same artwork. These are for printers who ask for CMYK rather than RGB.

| File | Pages | Trim |
|---|---|---|
| `t4c-letterhead-a4-cmyk.pdf` | 1 | A4 210x297 mm |
| `t4c-enrolment-form-a4-cmyk.pdf` | 2 | A4 210x297 mm |
| `t4c-poster-a2-cmyk.pdf` | 1 | A2 420x594 mm |
| `t4c-poster-a3-v1-cmyk.pdf` | 1 | A3 297x420 mm |
| `t4c-poster-a3-v2-cmyk.pdf` | 1 | A3 297x420 mm |
| `t4c-poster-a3-v3-cmyk.pdf` | 1 | A3 297x420 mm |
| `t4c-flyer-a5-v1-cmyk.pdf` | 2 | A5 148x210 mm |
| `t4c-flyer-a5-v2-cmyk.pdf` | 2 | A5 148x210 mm |
| `t4c-flyer-a5-v3-cmyk.pdf` | 2 | A5 148x210 mm |

## How they were made

Ghostscript 10.08.0, from the RGB master in the parent folder:

```powershell
gswin64c -dNOSAFER -dBATCH -dNOPAUSE -sDEVICE=pdfwrite -dPDFSETTINGS=/prepress `
  -sColorConversionStrategy=CMYK `
  -sDefaultRGBProfile=iccprofiles/srgb.icc `
  -sOutputICCProfile=iccprofiles/default_cmyk.icc `
  -sOutputFile=out-cmyk.pdf in.pdf
```

- Source profile: sRGB (`srgb.icc`, shipped with Ghostscript).
- Destination profile: `default_cmyk.icc`, Ghostscript's generic CMYK
  profile. It is not a named press standard. No output intent is embedded.
- Everything is DeviceCMYK. Verified: zero `/DeviceRGB` references in any
  file.
- `/prepress` keeps image resolution and does not downsample the photographs.

## Ink used

Measured from the converted files, not estimated:

| Element | CMYK build | Total area coverage |
|---|---|---|
| Brunswick Green, flat panels | 85, 48, 79, 58 | 270% |
| Antique Gold, flat panels | 11, 30, 100, 0 | 141% |
| Chalk White, paper panels | 0, 0, 0, 0 | 0% |
| Obsidian Black, type | 0, 0, 0, 100 | 100% |

The brand book gives different builds for the same two colours:

| Brand book | CMYK build | Total area coverage |
|---|---|---|
| Brunswick Green | 81, 0, 27, 77 | 185% |
| Antique Gold | 0, 22, 83, 11 | 116% |

The gap matters. A profile conversion cannot know that the client wants a
specific ink mix, so it produces a richer, heavier green than the brand
specifies: 48% magenta in a colour that has no magenta in it by design, and
85 points more total ink. If exact brand match on press is the priority, ask
the printer to build the two flat panels as 81/0/27/77 and 0/22/83/11 and to
leave the photographs as converted. That is a two swatch change in their
imposition and it also drops the green from 270% to 185%.

If they simply print this bundle as supplied, it will look close, slightly
cooler and darker in the green.

## Total area coverage per piece

Sampled across every page at 24 dpi.

| Piece | Mean TAC | Peak TAC | Area over 300% |
|---|---|---|---|
| Letterhead | 59% | 297% | none |
| Enrolment form | 33% | 298% | none |
| Poster A2 | 243% | 300% | none |
| Poster A3 v1 | 203% | 297% | none |
| Poster A3 v2 | 131% | 296% | none |
| Poster A3 v3 | 251% | 345% | 12.4% |
| Flyer A5 v1 | 190% | 296% | none |
| Flyer A5 v2 | 183% | 304% | none |
| Flyer A5 v3 | 62% | 299% | none |

Most coated stock accepts 300 to 330%, so everything except poster v3 sits
inside a normal limit. Poster v3 is the duotone violin and its upper panel is
deliberately dense. Two options:

1. Ask the printer to apply their house ink limit. Nothing will visibly
   change at 330% on a poster read at two metres.
2. Print the RGB master, `../t4c-poster-a3-v3.pdf`, and let their RIP convert.
   The result is the same artwork with their own profile and limit.

Do not try to fix it by lightening the artwork. The duotone was already lifted
once to bring the peak down from 400%; going further flattens the photograph
and the panel stops being the reason the poster exists.

## What to send a printer

1. The PDF from `../` if they accept RGB. That is the master, and the brand
   hex values are exact in it.
2. The PDF from here if they require CMYK.
3. This page, or the ink table above, so they know what the flats should be.
4. 3 mm bleed. The artboards are at trim size, so the bleed has to be added in
   imposition. Every edge is a solid brand colour, so it is a flat extension.
