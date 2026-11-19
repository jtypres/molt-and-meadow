# Molt & Meadow

A cozy idle game about real bugs. Restore a meadow, open field jars to discover species, and care for the tarantulas, scorpions and beetles you keep.

- **Meadow:** restore plots so wild bugs return and earn pollen, even while you're away.
- **Finds:** open jars to discover 12 real species across two sets.
- **Shelf:** mist, feed and set up enclosures. Spiders, scorpions and grasshoppers grow by molting.
- **Journal:** collect every species and its variants.

## Play

Open the live page on a phone and use "Add to Home Screen" to keep it like an app. Play from the Home Screen icon: on iPhone, Safari can clear saves for websites you haven't opened in about a week, but not for Home Screen apps.

Your save lives on the device. Use **Journal → Backup & restore** to save a backup file or copy a save code, and restore it on any device. The game reminds you to back up about once a week.

## Run locally

```bash
python3 -m http.server 5173
```

Then open http://localhost:5173. Add `?fast` to the address to run all timers 60× faster for testing.

## Art

All creature art is original, hand-built SVG in `js/art.js`, drawn from reference photos. Fonts are Fredoka and Nunito (SIL Open Font License) from Google Fonts.

## Publishing an update

Run `./scripts/bump-version.sh` before each push. It stamps a new version onto every script and stylesheet, so phones load the new code instead of a cached copy.
