# Changelog

## [Unreleased]

### Added
- **Info modal (ℹ)** — moved instructions to a toggleable modal dialog triggered by info button; supports keyboard close (Esc) and click-outside dismissal
- **Luna toggle (🌙)** — adds an extra Secret Room and an extra Super Secret Room to the floor (2 of each instead of 1); stacks with Fragmented Card for up to 3 Secret Rooms total
- Luna section in UI with toggle and info note explaining room counts
- **Fragmented Card toggle (🃏)** — detects and tracks two Secret Rooms when the Fragmented Card trinket is held; stats display progress as "1/2 Secret Rooms found — searching for 2nd"
- **Ultra Secret Room (❓) toggle** — detects isolated cells reachable only via adjacent Red Rooms
  - Candidates prioritized by connection count: 3+ highest, 2 fallback, 1 last resort (cascade display like SR/SSR)
  - Red Room paths invalid if adjacent to Boss, Secret, or Super Secret Rooms
  - USR symbol added to Map Symbols picker
- **Secret Rooms toggle panel** — new section (green theme) with live candidate detection
  - Empty cells adjacent to 3–4 rooms highlighted with green pulse + 🗝 icon (Secret Room candidate)
  - Empty cells adjacent to exactly 1 room highlighted with purple pulse + ⭐ icon (Super Secret Room candidate)
- **Wall strips** — clickable edge strips on room cells facing empty space; green = unchecked, red = already bombed
  - Any single red (blocked) strip instantly eliminates that cell as a SR/SSR candidate
  - Strip positions shift correctly when using the Move Marked Cells arrows
- **Found markers** — new map symbols ❔ (Secret Room found) and ❔ (Super Secret Room found); placing either stops detection for that type
- **Exclusion rules** — SR/SSR candidates cannot be adjacent to boss rooms (💀) or to each other (❔ cells exclude adjacent SSR candidates)

### Changed
- Red Rooms no longer count as "real rooms" for SR/SSR detection (fixed false SSR candidates adjacent to placed Red Rooms)
- SR detection uses cascading adjacency thresholds: prefer 3+, fall back to 2, then 1 (only if SSR found) to more intelligently rank candidates
- Downloaded map filename now includes a timestamp (e.g., `isaac_map_20260426143022.png`) to prevent overwrites
- **SR/SSR marker styling** — restyled as gray backgrounds (SR: #808080 medium gray, SSR: #333333 dark gray) with white ❔ icon for both, improving visual consistency
- **Legend and stats colors** — updated to gray palette to match new SR/SSR marker styling
- README: added "Secret Room Detection" section with detailed rules, wall strip guide, and marking instructions; added "Ultra Secret Room Detection" section; added "Luna" section
- Secret Room stats display now dynamically shows X/Y count format (e.g., "1/3 Secret Rooms found — searching for next") when multiple rooms are expected, with Luna or Fragmented Card
- Super Secret Room stats similarly supports multiple targets with Luna (up to 2 SSR with Luna alone, or 2 SSR + 3 SR combined)
- Instructions updated to mention Luna toggle effect
- Restored hidden Edmund comment

### Fixed
- Replaced `cell.textContent` assignment with a `cell-text` span to prevent wall strip DOM nodes from being destroyed on cell re-mark
- SSR candidate detection now properly excludes cells adjacent to already-marked Super Secret Rooms (prevents duplicate adjacencies)

---

## [0.2.2] — 2026-04-26

### Changed
- Rewrote instructions block: replaced stale v0.1 copy with actionable tips (start from center, arrow button usage, ✕ accuracy tip, special room shape limitation)

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
