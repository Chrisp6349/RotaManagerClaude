# Cardiothoracic Theatre Rota Manager

The allocation manager for Cardiothoracic Theatres, Derriford Hospital.
Used to build the weekly ODP and anaesthetist allocations, save them to
a shared Google Sheet, print the wall sheet, and publish to the live
Cardiac Theatre Dashboard (separate repository: CT-Rota-Viewer-PWA).

**Live app:** https://chrisp6349.github.io/RotaManagerClaude/

---

## Routine maintenance

All routine changes happen in **`config.js`**:

| When | What to edit |
|---|---|
| ODP joins or leaves | Add/remove the name in the `odps` list |
| Anaesthetist joins or leaves | Add/remove initials in the `anaes` list |
| New year's bank holidays announced | Update the `bankHolidays` dates |
| A new list type is needed | Add it to `listOptions` |

**Keep names unique** — two people both entered as "Chris" would
confuse the duplicate-checker and the viewer's My Week feature.
Use "Chris P" / "Chris B" style if needed.

Removing a leaver only removes them from future dropdowns — historic
weeks in the Sheet keep their name, which is correct for records.

**Remember:** new female anaesthetists and bank holidays must ALSO be
added to the viewer's `config.js` (see that repository's README).

## Save vs Publish — they are different

- **Save Rota** stores the week in the Google Sheet (the working copy)
- **Publish to Viewer** is what updates the live dashboard everyone sees

Saving without publishing leaves the viewer out of date. The app
reminds you after each save.

## Safety features worth knowing

- **Unsaved changes:** an amber badge appears when there are unsaved
  edits; switching weeks or closing the tab warns first
- **Clear All** requires typing the word CLEAR — it cannot be
  triggered by an accidental click
- **Save self-heals:** saving a week rebuilds its data from what is
  on screen, which automatically removes any stale "ghost" entries
  from older versions of the app

## File map

| File | Purpose |
|---|---|
| `config.js` | **Edit this one.** Staff, list options, bank holidays, API URL |
| `index.html` | Page structure, buttons, week stepper |
| `styles.css` | All styling |
| `render.js` | Builds the allocation tables; today-row highlight |
| `data.js` | Load/save/clear, unsaved-changes protection |
| `print-preview.js` | The printable A4 wall sheet |
| `viewer-publish.js` | Builds and publishes the viewer data |
| `state.js` / `main.js` | Shared state and startup |
| `logo.jpg` | Department logo (used on screen and on the print sheet) |

## The backend

Both apps talk to a Google Apps Script Web App attached to a Google
Sheet (URL in `config.js`). The Sheet holds every saved week and the
published viewer data. If the Sheet or Script is ever changed, both
apps' `config.js` files need the new URL.

## How to make changes safely

This app is in live daily use. For anything experimental, copy the
files to a separate repository, test there with GitHub Pages, and
copy back when happy — do not experiment here directly.
