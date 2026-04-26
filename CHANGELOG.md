# Changelog

## [Unreleased]

---

## [0.2.1] — 2026-04-26

### Changed
- Renamed `isaacCurseOfTheLost.html` to `index.html` for GitHub Pages compatibility
- Updated README: file reference, corrected ★ symbol entry in the symbol table, updated Stack section to reflect multi-file structure

---

## [0.2.0] — 2026-04-26

### Changed
- Renamed "Other Room" cell type internally from `question` to `other` (no visual change for the user)
- "Other Room" symbol changed from `?` to `★` on the map

### Added
- Fan-made disclaimer in the footer clarifying the tool is not affiliated with Edmund McMillen / Nicalis
- **The Void Floor mode** — toggle that activates Delirium detection on boss rooms
- **Delirium analysis** — each 💀 Boss Room cell is evaluated against all 4 possible 2×2 expansions; rooms that cannot contain Delirium are visually ruled out
  - ⚠ gold pulsing border: at least one valid 2×2 expansion exists
  - ✕ dimmed overlay: all orientations blocked by boundaries or adjacent rooms
- **Delirium indicators in PNG export** — gold border + ⚠ or diagonal X drawn onto downloaded image when Void mode is active
- **Empty Room symbol ✕** — marks a grid cell as confirmed empty (no room); blocks boss room 2×2 expansion from using that cell
- Live stats panel showing boss room count, possible Delirium count, and ruled-out count

### Changed
- 💀 skull symbol renamed from "Enemy Room" to **Boss Room** (used for Delirium detection)
- Red symbol renamed from "Boss Room" to **Red Room**
- Refactored cell marking into shared `applyMarkToCell` / `getCellText` helpers

### Fixed
- Delirium check now correctly blocks expansions where an expansion cell is adjacent to an already-marked room (not just overlapping with one)
- Empty Room (✕) cells properly block 2×2 expansion slots — a confirmed-empty cell cannot be part of a boss room block

### Project
- Added `README.md` with full feature documentation, symbol table, and Void mode usage guide
- Added `CHANGELOG.md` for release tracking
- Added `.gitignore`
- Added `.claude/settings.json` with a `PreToolUse` agent hook that auto-updates CHANGELOG.md before every `git commit`
- Removed `main.py` (Python prototype, superseded by the HTML tool)

---

## [0.1.0] — Initial release

### Added
- 13×13 interactive grid for manual map tracking
- Five map symbols: Visited (white), Unvisited (dark), Red Room, Enemy Room (💀), Unknown (?)
- Arrow buttons to shift the entire marked map in any direction
- Clear Grid button
- Download Map as PNG
- Responsive layout for mobile screens
