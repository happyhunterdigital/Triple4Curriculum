# Triple 4 Curriculum print kit

Office print collateral for T4C admissions, built entirely from the brand
system already in this repository: the Prestige Crest Identity palette from
`src/index.css`, the self-hosted Plus Jakarta Sans and Inter webfonts from
`public/fonts`, and the official crest. No third-party fonts, scripts or
network requests are involved; the crest PNG is stored locally in `assets/`.

## Contents

| File | Size | Purpose |
|---|---|---|
| `t4c-letterhead-a4.html` | A4 210x297 mm | Admissions letterhead with merge fields (dotted lines) for the recipient, subject and date |
| `t4c-enrolment-form-a4.html` | A4, 2 pages | Application form (page 1) plus fees, agreement, consents and signatures (page 2) |
| `t4c-poster-a2.html` | A2 420x594 mm | Enrolment campaign poster, portrait |
| `print.css` | | Shared print design system (tokens, sheets, letterhead, form, poster) |
| `assets/t4c-crest.png` | | Official crest, original source |
| `assets/t4c-crest-transparent.png` | | Crest with the white backdrop keyed out, for use on cream, green or black |
| `_export/` | | Rendered previews (PNG) and print-ready PDFs |
| `_export.html`, `_crest.html` | | Local build helpers, see below |

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
  letterhead footer, the form footer and the poster footer.
- The logo must never print narrower than 0.83 in / 80 px (21 mm), with clear
  space of at least 15 px at 80 px width, i.e. about a fifth of the mark's
  width. This kit therefore uses 25 mm on the letterhead, 21.5 mm in form
  headers, 22 mm in the letterhead footer and 62 mm (with 5.5 mm of white
  inside the plate) on the poster.
- One functional tint exists: `--gold-ink` (`#8A6A10`), Antique Gold darkened
  for 8 pt type on white where pure gold would lose contrast. It is a print
  legibility tint, not an additional brand colour.
- Copy follows the brand voice: empowering, caring, inspiring, professional.
  Balanced, plain sentences; no exclamation marks; no em or en dashes.
- Fees shown on form page 2 match `src/components/site/PricingTable.tsx`.
  If tuition changes, update both places.

## Exporting

### Print-ready PDF from the command line

```powershell
chrome --headless=new --disable-gpu --no-pdf-header-footer `
  --print-to-pdf="out.pdf" "file:///path/to/print/t4c-letterhead-a4.html"
```

Each artboard sets its own `@page` size and zero margins, so the PDF comes
out at exact trim size (A4 or A2) with full-bleed backgrounds.

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
  --window-size=794,1123 `
  --screenshot="preview.png" `
  "file:///path/to/print/_export.html?src=t4c-letterhead-a4.html&w=210&h=297"
```

Add `&p=2` for page 2 of a multi-page file. Sizes at 96 dpi: A4 is
794x1123, A2 is 1587x2245.

### Building the crest asset

`_crest.html` regenerates `assets/t4c-crest-transparent.png` from the
original PNG (keys out the white backdrop and the drop shadow). Run it in a
browser and screenshot the canvas with a transparent background; it is only
needed again if the official crest image changes.

## Print production notes

- Letterhead and forms are designed for uncoated white or cream 100 to
  120 gsm. The letterhead footer and form headers are full-bleed, so ask the
  printer to print borderless or trim to size.
- The poster is full-bleed Brunswick Green; add 3 mm bleed on each edge when
  sending to a commercial printer (the HTML artboard is at trim size, so
  scale by the printer's bleed workflow). The supplied CMYK values are the
  brand book conversions, so a printer matching to `#0B3B2B` and `#E2B026` in
  coated stock will stay on brand.
- Home or office printers cannot print A2; print the poster through a
  commercial printer using the supplied PDF.
- The letterhead is a template: the dotted `.fill` runs are replaced when the
  letter is merged, or handwritten over.

## Consent note

These are print templates, not site pages. The only scripts in this folder
are the small first-party helpers in `_export.html` and at the end of each
artboard that enable export mode for local rendering. They make no network
requests and are not shipped to any website.
