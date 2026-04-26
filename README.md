# Isaac's Map Helper — Curse of The Lost

A browser-based map tracker for **The Binding of Isaac: Repentance+**, designed for runs affected by the **Curse of The Lost** or **Amnesia** curse, where the minimap is hidden.

Open `index.html` directly in any browser — no install, no server required.

---

## What it does

Lets you manually reconstruct the floor map on a 13×13 grid (the maximum map size in the game) by clicking cells and assigning room symbols as you explore. Includes a **Void floor mode** that analyzes boss rooms to predict which one is most likely to contain **Delirium**.

---

## Map Symbols

| Symbol | Color | Meaning |
|--------|-------|---------|
| _(blank)_ | White | Visited Room |
| _(blank)_ | Dark grey | Unvisited Room (known but not entered) |
| _(blank)_ | Red | Red Room |
| 💀 | Grey | Boss Room |
| ★ | Orange | Other Room (Treasure, Sacrifice, etc.) |
| ✕ | Dark blue | Empty — confirmed no room at this position |

---

## Controls

- **Click a cell** — applies the selected symbol
- **Click same symbol again** — removes the mark
- **Arrow buttons** — shifts the entire marked map one cell in that direction (useful when you realize your starting reference is off)
- **Clear Grid** — resets all marks
- **Download Map** — exports the current grid as a PNG image

---

## The Void Mode

Enable the **🔮 The Void Floor** toggle to activate Delirium detection.

When active, every 💀 Boss Room cell is analyzed and marked with one of two indicators:

| Indicator | Meaning |
|-----------|---------|
| ⚠ (gold pulse) | **Possible Delirium** — a valid 2×2 expansion exists within bounds, with no other rooms blocking or adjacent to the expansion cells |
| ✕ (dimmed) | **Ruled Out** — all 2×2 orientations are blocked by map boundaries or nearby rooms |

### How the Delirium check works

Delirium's room is a 2×2 block on the map. For each boss room cell, the tool tries all 4 possible 2×2 orientations that include that cell and checks:

1. All 4 cells of the block are within the 13×13 map boundary
2. The 3 non-boss cells are **unmarked** (unknown space — ✕ empty marks block the expansion, as no room can exist there)
3. None of the expansion cells' neighbors outside the 2×2 block are marked rooms (the 2×2 would otherwise connect to those rooms)

The boss room cell's own neighbors are **not** checked against rule 3 — that is the corridor used to reach the boss room.

### Tips

- Mark cells as ✕ (Empty) whenever you know a grid position has no room. This gives the algorithm more information and produces fewer false positives.
- The Void map can be dense; ruling out boss rooms early lets you safely farm items from the ones that can't be Delirium.
- Entering boss rooms via a teleport card is safer in case you walk into Delirium unexpectedly.

---

## Stack

Vanilla HTML, CSS, and JavaScript — three files, no dependencies, no build step. Works offline and can be hosted statically (e.g. GitHub Pages).
