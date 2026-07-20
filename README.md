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
| ❔ | Light grey | Secret Room (found) |
| ❔ | Dark grey | Super Secret Room (found) |
| ❓ | Dark maroon | Ultra Secret Room (found) |

---

## Controls

- **Click a cell** — applies the selected symbol
- **Click same symbol again** — removes the mark
- **Arrow buttons** — shifts the entire marked map one cell in that direction (useful when you realize your starting reference is off)
- **Clear Grid** — resets all marks
- **Download Map** — exports the current grid as a PNG image with a timestamp in the filename
- **ℹ button** — opens a popup with full usage instructions

---

## Secret Room Detection

Enable the **🗝️ Secret Rooms** toggle to highlight possible Secret Room and Super Secret Room locations.

### How it works

The tool scans every empty cell on the grid and counts how many marked rooms are adjacent to it (up, down, left, right). Candidates are highlighted based on the following rules:

**Secret Room (🗝 green pulse):**
- Prefers empty cells adjacent to **3–4 rooms** (the game always spawns the SR where it touches the most rooms)
- Falls back to **2 adjacent** rooms if no 3–4 candidates exist
- Falls back to **1 adjacent** room only if the Super Secret Room is already found and no 2+ candidates exist

**Super Secret Room (⭐ purple pulse):**
- Empty cells adjacent to exactly **1 room** (dead-end position)

**Exclusion rules:**
- Neither SR nor SSR can be adjacent to a Boss Room (💀)
- SR candidates are never shown adjacent to a placed SSR marker (they cannot share a wall)
- SSR candidates are never shown adjacent to a placed SR marker

### Wall strips

When Secret Room mode is active, room cells show colored edge strips on sides that face empty space — these represent walls you can bomb:

| Strip color | Meaning |
|-------------|---------|
| Green | Wall not yet checked — worth bombing |
| Red | Already checked (bombed and found nothing) |

Click any wall strip to toggle it red. A cell with all its strips marked red is automatically excluded as a candidate.

### Marking found rooms

Once you find a Secret Room or Super Secret Room, select the matching ❔ symbol from **Map Symbols** and click the cell. The tool will stop showing candidates for that room type.

---

## Fragmented Card

Enable the **🃏 Fragmented Card** toggle if you have this trinket in your run.

Fragmented Card causes a second Secret Room to spawn on the floor. The tool will keep showing Secret Room candidates until both are found, and the stats display progress as **1/2 Secret Rooms found — searching for 2nd** while one remains.

Once both are marked with ❔, detection stops. The Super Secret Room is unaffected.

---

## Luna

Enable the **🌙 Luna** toggle if this floor has its effect active.

Luna adds an extra Secret Room *and* an extra Super Secret Room to the floor — 2 of each instead of 1. It stacks with Fragmented Card, so a floor can have up to **3 Secret Rooms** (Fragmented + Luna) and **2 Super Secret Rooms** (Luna).

The stats display progress the same way as Fragmented Card, e.g. **1/3 Secret Rooms found — searching for next**. As with the base rules, none of the same-type rooms can be adjacent to each other, so once one is marked with ❔, candidates touching it are excluded from the next search.

Once all expected rooms of a type are marked with ❔, detection stops for that type.

---

## Ultra Secret Room Detection

Enable the **❓ Ultra Secret Room** toggle to highlight possible USR locations.

### How it works

Ultra Secret Rooms are isolated — no direct door connections to the rest of the map. They can only be reached by opening a Red Room adjacent to them (Red Key, Crystal Key, Cracked Key, Soul of Cain, etc.).

The tool scans for empty cells that:
- Have **no real rooms as direct neighbors** (only empty cells or Red Rooms around them)
- Are reachable through adjacent Red Room paths that connect to at least one regular room

Candidates are prioritized by total connections through valid Red Room paths:

| Priority | Connections | Likelihood |
|----------|-------------|------------|
| Highest | 3 or more | ~11.5× more likely than a 2-connection spot |
| Fallback | 2 | ~11.5× more likely than a 1-connection spot |
| Last resort | 1 | Only shown when no higher-priority spots exist |

Only the **highest non-empty bucket** is displayed at a time.

**A Red Room path is invalidated if it is adjacent to a Boss Room, Secret Room, or Super Secret Room.**

### Tips

- When you have multiple Red Room options, **mark the potential ones on the map** to visualize your choices. If the Red Room you open is adjacent to the USR, the USR door opens automatically when you enter it.
- Prioritize opening the Red Room that connects to the highest number of other rooms — it covers more possible USR locations in one move.
- Once you locate the USR, mark it with ❓ from Map Symbols to stop detection.

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
