# Triple 4 Curriculum social kit

Launch content that introduces the school across Instagram, Facebook, X,
LinkedIn and TikTok, built on the brand book palette and the positioning in
`docs/social-launch.md`.

## What is here

| File | What it is |
|---|---|
| `social-copy.md` | The content: seven posts written per platform, three short video scripts, hashtag banks, alt text, two week publishing order and reply guidance |
| `tiles.html` | Six 1080x1080 feed tiles |
| `vertical.html` | Three 1080x1920 story and reel frames |
| `wide.html` | 1600x900 for X and 1200x627 for LinkedIn and Facebook link cards |
| `social.css` | Tile design system: brand palette, type, rows, stat block |
| `assets/` | Crest, original and with the white background keyed out |
| `_export/` | Rendered PNGs, ready to post |
| `_export.html` | Local render helper, see below |

## Rendered assets

```
tile-01-hero.png          1080x1080   launch
tile-02-four.png          1080x1080   the 4-4-4 model
tile-03-difference.png    1080x1080   teachers, class size, Fridays
tile-04-sixteen.png       1080x1080   the class cap
tile-05-weekend.png       1080x1080   balance
tile-06-cta.png           1080x1080   enrolment
story-01-hook.png         1080x1920   story and reel cover
story-02-model.png        1080x1920   story explainer
story-03-cta.png          1080x1920   story close
wide-x-1600x900.png       1600x900    X and link previews
wide-li-1200x627.png      1200x627    LinkedIn and Facebook card
```

## Design rules

- Brunswick Green `#0B3B2B`, Antique Gold `#E2B026`, Chalk White `#FAF9F5`,
  Obsidian Black `#1A1C1E`, straight from the brand book.
- Plus Jakarta Sans for headlines, Inter for body, Georgia italic only for the
  "Golden Achievers" line.
- The crest never prints below 80 px wide, with about a fifth of its width in
  clear space. Tiles use 108 px, so one asset set stays consistent.
- Gold on white uses the darker `--gold-ink` tint for small type; gold stays
  pure for display sizes and on dark grounds.
- No third-party fonts or scripts. Nothing loads from outside this repository.

## Re-rendering

```powershell
chrome --headless=new --disable-gpu --hide-scrollbars `
  --default-background-color=00000000 `
  --window-size=1080,1080 `
  --screenshot="tile-01-hero.png" `
  "file:///path/to/social/_export.html?src=tiles.html&w=1080&h=1080&p=1"
```

`p` selects the artboard in the file (1 to 6 for tiles, 1 to 3 for vertical,
1 to 2 for wide). Use `--window-size=1080,1920` for vertical and
`1600,900` or `1200,627` for wide. `--default-background-color=00000000`
keeps the corners transparent, which matters for stories.

## Before posting

1. Check every claim against `docs/social-launch.md`; the numbers and names in
   the copy are taken from there.
2. Never post a learner's face or name without written guardian consent.
3. Use the UTM link for that platform, not the bare homepage.
4. Add the alt text from `social-copy.md` section 8.
5. Burn captions into every video and say the URL out loud at the end.

## Consent note

These are static assets. The only scripts in this folder are the first-party
export helper and the small page-scroll helper at the end of each artboard,
used for local rendering. No analytics, pixels or third-party requests.
