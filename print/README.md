# Triple 4 Curriculum print kit

Office and campaign print collateral for T4C admissions, built entirely from
the brand system already in this repository: the brand book palette, the
self-hosted Plus Jakarta Sans and Inter webfonts from `public/fonts`, and the
official crest. No third-party fonts, scripts or network requests are
involved; the crest, photographs and QR code are stored locally in `assets/`.

## Contents

| File | Size | Purpose |
|---|---|---|
| `t4c-letterhead-a4.html` | A4 210x297 mm | Admissions letterhead with merge fields (dotted lines) for the recipient, subject and date |
| `t4c-enrolment-form-a4.html` | A4, 2 pages | Application form (page 1) plus fees, agreement, consents and signatures (page 2) |
| `t4c-poster-a2.html` | A2 420x594 mm | Typographic enrolment poster, portrait |
| `t4c-poster-a3-v1.html` | A3 297x420 mm | Photo poster, full bleed classroom, type in the lower third |
| `t4c-poster-a3-v2.html` | A3 297x420 mm | Photo poster, split cream type panel and full height teacher portrait |
| `t4c-poster-a3-v3.html` | A3 297x420 mm | Photo poster, duotone violin, centred type |
| `t4c-flyer-a5-v1.html` | A5 148x210 mm, 2 pages | Photo flyer: violin front, classroom diptych back |
| `t4c-flyer-a5-v2.html` | A5 148x210 mm, 2 pages | Photo flyer: classroom hero front, 4-4-4 band and portrait fees on the back |
| `t4c-flyer-a5-v3.html` | A5 148x210 mm, 2 pages | Photo flyer: cream typographic front with portrait card, dark back |
| `t4c-flyer-a5-v4-admissions-2027.html` | A5 148x210 mm, 2 pages | Photo-led admissions flyer for 2027 using the happyhunterdigital document palette; includes the Black Friday extension to 5 December 2026 |
| `print.css` | | Shared print design system (tokens, sheets, letterhead, form, poster, flyer, photography) |
| `assets/t4c-crest.png` | | Official crest, original source |
| `assets/t4c-crest-transparent.png` | | Crest with the white backdrop keyed out, for use on cream, green or black |
| `assets/photos/` | | The five school photographs, as delivered |
| `assets/qr-admissions.png` | | QR to the UTM tagged admissions page, used on every poster and flyer |
| `_export/` | | Rendered previews (PNG) and print-ready PDFs |
| `_export.html`, `_crest.html` | | Local build helpers, see below |
| `README.md` | | This file |

## Brand rules used across the kit

Taken from the T4C brand book, not inferred:

| Role | Colour | Hex | CMYK |
|---|---|---|---|
| Primary ground | Brunswick Green | `#0B3B2B` | 81, 0, 27, 77 |
| Accent | Antique Gold | `#E2B026` | 0, 22, 83, 11 |
| Paper tone | Chalk White | `#FAF9F5` | 0, 0, 2, 2 |
| Type and rules | Obsidian Black | `#1A1C1E` | 13, 7, 0, 88 |

- Plus Jakarta Sans is the primary typeface, Inter the secondary. Georgia
  italic appears only for the "Golden Achievers" script line and the brand
  tagline, as a stand-in for the engraved script in the crest.
- The tagline is **"Preserving Fresh Minds Globally."** It sits in the
  letterhead footer, the form footer, the A2 poster footer and the two photo
  posters that carry a footer band.
- The logo must never print narrower than 0.83 in / 80 px (21 mm), with clear
  space of at least 15 px at 80 px width, i.e. about a fifth of the mark's
  width. This kit therefore uses 25 mm on the letterhead, 21.5 mm in form
  headers, 22 mm in the letterhead footer, 62 mm on the A2 poster, 26 to 30 mm
  on the A3 posters and 16 to 18 mm inside a white disc on the A5 flyers.
- One functional tint exists: `--gold-ink` (`#8A6A10`), Antique Gold darkened
  for 8 pt type on white where pure gold would lose contrast. It is a print
  legibility tint, not an additional brand colour.
- Copy follows the brand voice: empowering, caring, inspiring, professional.
  Balanced, plain sentences; no exclamation marks; no em or en dashes.
- Fees shown on form page 2 and on poster v2 match
  `src/components/site/PricingTable.tsx`. If tuition changes, update both
  places.
- Contact details, the admissions URL and the UTM campaign tag come from
  `docs/social-launch.md`: `+27 689 758 960`, `info@triple4c.com`,
  `triple4c.com/admissions`, `utm_campaign=launch2026`.

## Admission in Progress campaign

`t4c-flyer-a5-v4-admissions-2027.html` is a separate campaign piece. It uses the
happyhunterdigital document palette and Inter-only typography, not the green and
gold brand book system, because the brief called for agency branding and a new
creative direction. It announces the 2027 intake and carries the Black Friday
offer: 10% off all terms with code `BLACKFRIEND10`, new registrations only,
extended to 5 December 2026. The same deadline is used in `HomePage.tsx` and
`FirstTermPrompt.tsx`; keep all three in step if the offer changes again.

The front carries the school crest and name, the "Admission in progress" hook
and headline, a real classroom photograph, grades offered, the offer deadline,
class size, the offer panel, and the direct CTA with phone, email, address and
QR code. The back carries five selling points, an Extra Skills photograph,
tuition by phase, terms, and a book-an-observation CTA. The companion digital
post is `../social/vertical-admissions-2027.html` for WhatsApp and Facebook.

## Photography

Five photographs were supplied through Cloudinary. They were downloaded at the
largest size Cloudinary serves and stored unchanged:

| File | Pixel size | Shows | Consent |
|---|---|---|---|
| `classroom.jpg` | 1376x1824 | Learner at a desk at home, science and map posters behind | Learner, guardian consent required |
| `violin.jpg` | 1136x1840 | Learner playing the violin, Extra Skills setting | Learner, guardian consent required |
| `learner3.jpg` | 701x1600 | Learner reading in a library | Learner, guardian consent required |
| `wonder.jpg` | 1080x1290 | Wonder Ngwenya, teacher | Staff, already published in `src/data/team.ts` |
| `lungile.jpg` | 1122x1402 | Lungile Mkhulise, teacher | Staff, already published in `src/data/team.ts` |

### Resolution

The originals are small. Placed full bleed on A3 they run at roughly 118 dpi;
cropped into flyer panels they run at 190 to 250 dpi. That is fine for a poster
read at two metres and for a hand held flyer, but it is not 300 dpi. If a
printer asks for 300 dpi, re-export the originals from the source shoot and
drop them into `assets/photos/` under the same names, then re-render. The
layouts are written so that only the crop position would need checking.

### Crop and treatment

- Every image is placed with `object-fit: cover` and an explicit
  `object-position` so faces stay inside the frame at any panel shape.
- Text over photography always sits on a `.ph-scrim`, a Brunswick Green
  gradient that is opaque where the type is and open where the subject is.
  There is no type over a face in any of the six pieces.
- The crest over photography sits in `.crest-plate`, a white disc, because the
  keyed out crest has no background of its own.
- Poster v3 and the violin social tile use a duotone: grayscale, slight
  contrast lift, then Brunswick Green at reduced opacity in `multiply`. It is
  a treatment of the brand colour, not a second palette.

### Consent

`classroom.jpg`, `violin.jpg` and `learner3.jpg` show identifiable learners.
Under POPIA and the Children's Act, do not print or post them without signed
guardian consent on file. If consent is withdrawn, delete the file from
`assets/photos/`, remove the piece that uses it, and re-render.

## The QR code

`assets/qr-admissions.png` is a 1200 px QR, error correction level H, encoding
the admissions page with the launch UTM tags. It is printed at 18 to 26 mm,
which is above the practical minimum for a phone camera.

To regenerate it (for example when the campaign changes), from a folder with
the `qrcode` package installed:

```js
// make-qr.js
const QR = require("qrcode");
const url = "https://triple4c.com/admissions?utm_source=print&utm_medium=qr&utm_campaign=launch2026";
QR.toFile("qr-admissions.png", url, { width: 1200, errorCorrectionLevel: "H", margin: 2, color: { dark: "#0B3B2B", light: "#FFFFFF" } });
```

Keep it dark on white. Do not put a QR on a photographic background, and never
invert it.

## Exporting

### Print-ready PDF from the command line

```powershell
chrome --headless=new --disable-gpu --no-pdf-header-footer `
  --print-to-pdf="out.pdf" "file:///path/to/print/t4c-poster-a3-v1.html"
```

Each artboard sets its own `@page` size and zero margins, so the PDF comes out
at exact trim with full-bleed backgrounds. Verified output:

| PDF | MediaBox | Pages |
|---|---|---|
| `t4c-poster-a3-v1/v2/v3.pdf` | `[0 0 841.92 1191.12]` | 1 |
| `t4c-flyer-a5-v1/v2/v3.pdf` | `[0 0 420 594.96]` | 2 |

### From the browser print dialog

Open the artboard, print, and set: destination "Save as PDF", paper size to
match the artboard, margins "None", scale 100 percent, and "Background
graphics" ON. Without background graphics the green and gold blocks will not
print.

### PNG previews

`_export.html` renders an artboard at exact mm size in an iframe for
screenshotting:

```powershell
chrome --headless=new --disable-gpu --hide-scrollbars `
  --window-size=1123,1587 `
  --screenshot="preview.png" `
  "file:///path/to/print/_export.html?src=t4c-poster-a3-v1.html&w=297&h=420"
```

Add `&p=2` for page 2 of a multi-page file. Sizes at 96 dpi: A5 is 559x794,
A4 is 794x1123, A3 is 1123x1587, A2 is 1587x2245.

### Building the crest asset

`_crest.html` regenerates `assets/t4c-crest-transparent.png` from the original
PNG (keys out the white backdrop and the drop shadow). Run it in a browser and
screenshot the canvas with a transparent background; it is only needed again
if the official crest image changes.

## Print production notes

- Letterhead and forms are designed for uncoated white or cream 100 to
  120 gsm. The letterhead footer and form headers are full-bleed, so ask the
  printer to print borderless or trim to size.
- The posters and flyers are full-bleed. The HTML artboards are at trim size,
  so add 3 mm bleed on each edge in the printer's imposition, or place the PDF
  on a larger page and extend the edge colour. Every edge of every photo piece
  ends in a solid brand colour, so extending it is a flat fill.
- The A5 flyers are supplied as two page PDFs, front then back, for double
  sided printing. Ask for a 3 mm bleed and trim, and check that the back is
  turned correctly if the stock is folded or duplexed on a short grain.
- The photographs are RGB. Colour will shift slightly on press; the greens in
  particular can print cooler. Ask the printer to match the supplied
  photographs by eye against a proof rather than by numeric conversion, and to
  keep Brunswick Green on the brand build (81, 0, 27, 77).
- Home or office printers cannot print A3 or A2. Send the poster PDFs to a
  commercial printer.
- The letterhead is a template: the dotted `.fill` runs are replaced when the
  letter is merged, or handwritten over.

## Colour and ink

The PDFs in this folder are authored in sRGB and carry the brand hex values
above. Most South African trade printers accept this and convert on their RIP
against their house profile.

Converted CMYK versions of all nine files sit in `_export/cmyk/`, with the
profile, the measured ink builds and the total area coverage for each piece
documented in `_export/cmyk/README.md`. Two things there are worth knowing
before you send anything to press:

- A profile conversion turns Brunswick Green into 85, 48, 79, 58 (270% total
  ink), not the brand book build of 81, 0, 27, 77 (185%). If exact brand match
  matters, tell the printer to set the flat panels to the brand book builds.
- Poster v3 reaches 345% peak coverage in its duotone panel. If the printer
  caps at 300%, send them the RGB master instead and let their RIP convert.

## Consent note

These are print templates, not site pages. The only scripts in this folder are
the small first-party helpers in `_export.html` and at the end of each
artboard that enable export mode for local rendering. They make no network
requests and are not shipped to any website.
