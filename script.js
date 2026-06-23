document.addEventListener('DOMContentLoaded', function() {
    const grid = document.getElementById('grid');
    const clearBtn = document.getElementById('clear-btn');
    const downloadBtn = document.getElementById('download-btn');
    const colorOptions = document.querySelectorAll('.color-option');
    const githubLink = document.getElementById('github-link');
    const voidToggle = document.getElementById('void-toggle');
    const secretToggle = document.getElementById('secret-toggle');
    const usrToggle = document.getElementById('usr-toggle');
    const upBtn = document.getElementById('up-btn');
    const downBtn = document.getElementById('down-btn');
    const leftBtn = document.getElementById('left-btn');
    const rightBtn = document.getElementById('right-btn');

    let selectedColor = 'white';
    let markedCells = {};
    let isVoidMode = false;
    let isSecretMode = false;
    let isUsrMode = false;
    let blockedWalls = new Set();

    githubLink.href = 'https://github.com/MauroDelNook';
    githubLink.textContent = 'MauroDelNook';

    const ALL_MARK_CLASSES = [
        'marked-white', 'marked-black', 'marked-red',
        'marked-skull', 'marked-other', 'marked-empty-room',
        'marked-sr', 'marked-ssr', 'marked-usr'
    ];

    function getCellText(color) {
        if (color === 'skull') return '💀';
        if (color === 'other') return '★';
        if (color === 'empty-room') return '✕';
        if (color === 'sr') return '❔';
        if (color === 'ssr') return '❔';
        if (color === 'usr') return '❓';
        return '';
    }

    function applyMarkToCell(cell, color) {
        cell.classList.remove(...ALL_MARK_CLASSES);
        const textEl = cell.querySelector('.cell-text');
        if (color) {
            cell.classList.add(`marked-${color}`);
            if (textEl) textEl.textContent = getCellText(color);
        } else {
            if (textEl) textEl.textContent = '';
        }
    }

    // ── Void / Delirium logic ──

    function canBeDelirium(row, col) {
        const GRID_SIZE = 13;
        // 4 ways (row,col) can be a corner of a 2×2 block
        const corners = [[0, 0], [0, -1], [-1, 0], [-1, -1]];
        for (const [dr, dc] of corners) {
            const r0 = row + dr;
            const c0 = col + dc;
            // Entire 2×2 must fit within 0–12
            if (r0 < 0 || r0 + 1 >= GRID_SIZE || c0 < 0 || c0 + 1 >= GRID_SIZE) continue;

            const blockSet = new Set([
                `${r0}-${c0}`, `${r0}-${c0+1}`,
                `${r0+1}-${c0}`, `${r0+1}-${c0+1}`
            ]);

            let valid = true;
            for (let dr2 = 0; dr2 <= 1 && valid; dr2++) {
                for (let dc2 = 0; dc2 <= 1 && valid; dc2++) {
                    const r = r0 + dr2, c = c0 + dc2;
                    if (r === row && c === col) continue; // skip boss cell itself

                    // Expansion cell must be truly unmarked — empty-room means no room
                    // can exist there, so the 2×2 boss block can't occupy it either
                    const type = markedCells[`${r}-${c}`];
                    if (type) { valid = false; continue; }

                    // Neighbors of this expansion cell that are outside the 2×2 must also be free.
                    // (Adjacency to the boss cell's own neighbors is allowed — that's the path in.)
                    for (const [nr, nc] of [[r-1,c],[r+1,c],[r,c-1],[r,c+1]]) {
                        if (blockSet.has(`${nr}-${nc}`)) continue;
                        if (nr < 0 || nr >= GRID_SIZE || nc < 0 || nc >= GRID_SIZE) continue;
                        const ntype = markedCells[`${nr}-${nc}`];
                        if (ntype && ntype !== 'empty-room') { valid = false; break; }
                    }
                }
            }
            if (valid) return true;
        }
        return false;
    }

    function updateDeliriumMarkers() {
        document.querySelectorAll('.cell').forEach(c => {
            c.classList.remove('boss-possible', 'boss-impossible');
        });
        if (!isVoidMode) return;

        let possible = 0, impossible = 0;
        for (const key in markedCells) {
            if (markedCells[key] !== 'skull') continue;
            const [row, col] = key.split('-').map(Number);
            const cell = document.querySelector(`.cell[data-row="${row}"][data-col="${col}"]`);
            if (!cell) continue;
            if (canBeDelirium(row, col)) {
                cell.classList.add('boss-possible');
                possible++;
            } else {
                cell.classList.add('boss-impossible');
                impossible++;
            }
        }

        const voidStats = document.getElementById('void-stats');
        const total = possible + impossible;
        if (total === 0) {
            voidStats.textContent = 'No boss rooms marked yet. Use the skull (💀) symbol to mark them.';
        } else {
            voidStats.innerHTML =
                `Boss Rooms: ${total} — ` +
                `<span class="stat-possible">${possible} possible Delirium</span> / ` +
                `<span class="stat-impossible">${impossible} ruled out</span>`;
        }
    }

    // ── Secret Room logic ──

    const DIRS = [
        { dr: -1, dc:  0, myWall: 'N', theirWall: 'S' },
        { dr:  1, dc:  0, myWall: 'S', theirWall: 'N' },
        { dr:  0, dc:  1, myWall: 'E', theirWall: 'W' },
        { dr:  0, dc: -1, myWall: 'W', theirWall: 'E' },
    ];

    function isRealRoom(r, c) {
        if (r < 0 || r >= 13 || c < 0 || c >= 13) return false;
        const type = markedCells[`${r}-${c}`];
        return type && type !== 'empty-room' && type !== 'red' && type !== 'usr';
    }

    function updateSecretRoomMarkers() {
        document.querySelectorAll('.cell').forEach(cell => {
            cell.classList.remove('sr-candidate', 'ssr-candidate');
            cell.querySelectorAll('.wall').forEach(w => {
                w.classList.remove('wall-active', 'wall-blocked');
            });
        });

        if (!isSecretMode) return;

        const srFound  = Object.values(markedCells).some(v => v === 'sr');
        const ssrFound = Object.values(markedCells).some(v => v === 'ssr');

        // Highlight empty cells that are SR or SSR candidates (only for unfound types)
        if (!srFound || !ssrFound) {
            const srBuckets = { 3: [], 2: [], 1: [] };
            const ssrList = [];

            for (let r = 0; r < 13; r++) {
                for (let c = 0; c < 13; c++) {
                    if (markedCells[`${r}-${c}`]) continue;

                    let totalRoom = 0, unchecked = 0;
                    for (const { dr, dc, theirWall } of DIRS) {
                        const nr = r + dr, nc = c + dc;
                        if (!isRealRoom(nr, nc)) continue;
                        totalRoom++;
                        if (!blockedWalls.has(`${nr}-${nc}-${theirWall}`)) unchecked++;
                    }

                    if (totalRoom === 0 || unchecked < totalRoom) continue;

                    const touchesBoss = DIRS.some(({ dr, dc }) => markedCells[`${r + dr}-${c + dc}`] === 'skull');
                    if (touchesBoss) continue;

                    const touchesSSR = DIRS.some(({ dr, dc }) => markedCells[`${r + dr}-${c + dc}`] === 'ssr');

                    const cell = document.querySelector(`.cell[data-row="${r}"][data-col="${c}"]`);
                    if (!cell) continue;

                    if (!srFound && !touchesSSR) {
                        const bucket = totalRoom >= 3 ? 3 : totalRoom;
                        if (srBuckets[bucket]) srBuckets[bucket].push(cell);
                    }

                    if (!ssrFound && totalRoom === 1) {
                        const touchesSR = DIRS.some(({ dr, dc }) => markedCells[`${r + dr}-${c + dc}`] === 'sr');
                        if (!touchesSR) ssrList.push(cell);
                    }
                }
            }

            // SR: prefer 3+ adjacent; if none, fall back to 2; if SSR known, allow any (1+)
            if (!srFound) {
                const srPool = srBuckets[3].length > 0 ? srBuckets[3]
                    : srBuckets[2].length > 0     ? srBuckets[2]
                    : ssrFound                    ? srBuckets[1]
                    : [];
                srPool.forEach(cell => cell.classList.add('sr-candidate'));
            }

            ssrList.forEach(cell => cell.classList.add('ssr-candidate'));
        }

        // Show wall strips on room cells whose walls face empty cells
        // (sr/ssr cells are already found — no need to bomb their walls)
        for (const key in markedCells) {
            const type = markedCells[key];
            if (type === 'empty-room' || type === 'sr' || type === 'ssr' || type === 'usr') continue;
            const [r, c] = key.split('-').map(Number);
            const cell = document.querySelector(`.cell[data-row="${r}"][data-col="${c}"]`);
            if (!cell) continue;

            for (const { dr, dc, myWall } of DIRS) {
                const nr = r + dr, nc = c + dc;
                if (nr < 0 || nr >= 13 || nc < 0 || nc >= 13) continue;
                if (markedCells[`${nr}-${nc}`]) continue; // adjacent cell is not empty

                const wallEl = cell.querySelector(`.wall-${myWall.toLowerCase()}`);
                if (!wallEl) continue;
                wallEl.classList.add('wall-active');
                if (blockedWalls.has(`${r}-${c}-${myWall}`)) wallEl.classList.add('wall-blocked');
            }
        }

        updateSecretStats();
    }

    function updateSecretStats() {
        const srFound  = Object.values(markedCells).some(v => v === 'sr');
        const ssrFound = Object.values(markedCells).some(v => v === 'ssr');
        const srCount  = document.querySelectorAll('.sr-candidate').length;
        const ssrCount = document.querySelectorAll('.ssr-candidate').length;
        const statsEl  = document.getElementById('secret-stats');

        const parts = [];
        if (srFound)        parts.push(`<span class="stat-sr">❔ Secret Room found!</span>`);
        else if (srCount > 0) parts.push(`<span class="stat-sr">${srCount} possible Secret Room${srCount !== 1 ? 's' : ''}</span>`);

        if (ssrFound)        parts.push(`<span class="stat-ssr">❔ Super Secret Room found!</span>`);
        else if (ssrCount > 0) parts.push(`<span class="stat-ssr">${ssrCount} possible Super Secret Room${ssrCount !== 1 ? 's' : ''}</span>`);

        if (parts.length === 0) {
            const hasRooms = Object.values(markedCells).some(v => v !== 'empty-room');
            statsEl.textContent = hasRooms
                ? 'No candidates found — all possible spots checked or ruled out.'
                : 'No rooms marked yet. Mark rooms to detect possible Secret Room locations.';
        } else {
            statsEl.innerHTML = parts.join(' &nbsp;·&nbsp; ');
        }
    }

    // ── Ultra Secret Room logic ──

    function updateUSRMarkers() {
        document.querySelectorAll('.cell').forEach(cell => {
            cell.classList.remove('usr-candidate');
        });

        if (!isUsrMode) return;

        const usrFound = Object.values(markedCells).some(v => v === 'usr');

        if (!usrFound) {
            const usrBuckets = { 3: [], 2: [], 1: [] };

            for (let r = 0; r < 13; r++) {
                for (let c = 0; c < 13; c++) {
                    if (markedCells[`${r}-${c}`]) continue; // candidate must be empty

                    // USR must not be directly adjacent to any real room (only empty/red cells around it)
                    let hasDirectRoom = false;
                    for (const { dr, dc } of DIRS) {
                        const nr = r + dr, nc = c + dc;
                        if (nr < 0 || nr >= 13 || nc < 0 || nc >= 13) continue;
                        const t = markedCells[`${nr}-${nc}`];
                        if (t && t !== 'empty-room' && t !== 'red') {
                            hasDirectRoom = true;
                            break;
                        }
                    }
                    if (hasDirectRoom) continue;

                    // Count connections through valid adjacent red room positions
                    let totalConnections = 0;
                    for (const { dr, dc } of DIRS) {
                        const nr = r + dr, nc = c + dc;
                        if (nr < 0 || nr >= 13 || nc < 0 || nc >= 13) continue;

                        const redT = markedCells[`${nr}-${nc}`];
                        if (redT && redT !== 'red') continue; // adjacent cell must be empty or already a red room

                        // Red room is invalid if adjacent to skull, SR, or SSR
                        let validRR = true;
                        for (const { dr: dr2, dc: dc2 } of DIRS) {
                            const mr = nr + dr2, mc = nc + dc2;
                            if (mr === r && mc === c) continue; // the USR cell itself — skip
                            if (mr < 0 || mr >= 13 || mc < 0 || mc >= 13) continue;
                            const mt = markedCells[`${mr}-${mc}`];
                            if (mt === 'skull' || mt === 'sr' || mt === 'ssr') {
                                validRR = false;
                                break;
                            }
                        }
                        if (!validRR) continue;

                        // Count regular rooms adjacent to this red room position (excluding USR cell)
                        for (const { dr: dr2, dc: dc2 } of DIRS) {
                            const mr = nr + dr2, mc = nc + dc2;
                            if (mr === r && mc === c) continue;
                            if (mr < 0 || mr >= 13 || mc < 0 || mc >= 13) continue;
                            const mt = markedCells[`${mr}-${mc}`];
                            if (mt && mt !== 'empty-room' && mt !== 'red' && mt !== 'usr') {
                                totalConnections++;
                            }
                        }
                    }

                    if (totalConnections === 0) continue;

                    const cell = document.querySelector(`.cell[data-row="${r}"][data-col="${c}"]`);
                    if (!cell) continue;

                    const bucket = totalConnections >= 3 ? 3 : totalConnections;
                    usrBuckets[bucket].push(cell);
                }
            }

            // Show only the highest non-empty bucket (same cascade as SR)
            const usrPool = usrBuckets[3].length > 0 ? usrBuckets[3]
                : usrBuckets[2].length > 0            ? usrBuckets[2]
                : usrBuckets[1];
            usrPool.forEach(cell => cell.classList.add('usr-candidate'));
        }

        updateUSRStats(usrFound);
    }

    function updateUSRStats(found) {
        const statsEl = document.getElementById('usr-stats');
        if (!statsEl) return;

        if (found) {
            statsEl.innerHTML = `<span class="stat-usr">❓ Ultra Secret Room found!</span>`;
            return;
        }

        const count = document.querySelectorAll('.usr-candidate').length;
        if (count === 0) {
            const hasRooms = Object.values(markedCells).some(v => v && v !== 'empty-room');
            statsEl.textContent = hasRooms
                ? 'No USR candidates — no valid isolated spots with Red Room access.'
                : 'No rooms marked yet. Mark rooms to detect possible USR locations.';
        } else {
            statsEl.innerHTML = `<span class="stat-usr">${count} possible Ultra Secret Room location${count !== 1 ? 's' : ''}</span>`;
        }
    }

    function handleWallClick(e, r, c, dir) {
        e.stopPropagation();
        if (!isSecretMode) return;
        const wallKey = `${r}-${c}-${dir}`;
        if (blockedWalls.has(wallKey)) blockedWalls.delete(wallKey);
        else blockedWalls.add(wallKey);
        updateSecretRoomMarkers();
    }

    voidToggle.addEventListener('change', function() {
        isVoidMode = this.checked;
        document.getElementById('void-info').style.display = isVoidMode ? 'block' : 'none';
        updateDeliriumMarkers();
    });

    secretToggle.addEventListener('change', function() {
        isSecretMode = this.checked;
        document.getElementById('secret-info').style.display = isSecretMode ? 'block' : 'none';
        updateSecretRoomMarkers();
    });

    usrToggle.addEventListener('change', function() {
        isUsrMode = this.checked;
        document.getElementById('usr-info').style.display = isUsrMode ? 'block' : 'none';
        updateUSRMarkers();
    });

    // ── Grid creation ──

    for (let row = 0; row < 13; row++) {
        for (let col = 0; col < 13; col++) {
            const cell = document.createElement('div');
            cell.className = 'cell';
            cell.dataset.row = row;
            cell.dataset.col = col;

            const textSpan = document.createElement('span');
            textSpan.className = 'cell-text';
            cell.appendChild(textSpan);

            ['N', 'S', 'E', 'W'].forEach(dir => {
                const wall = document.createElement('div');
                wall.className = `wall wall-${dir.toLowerCase()}`;
                wall.addEventListener('click', function(e) {
                    handleWallClick(e, row, col, dir);
                });
                cell.appendChild(wall);
            });

            cell.addEventListener('click', function() {
                const r = parseInt(this.dataset.row);
                const c = parseInt(this.dataset.col);
                const key = `${r}-${c}`;

                if (markedCells[key] === selectedColor) {
                    delete markedCells[key];
                    applyMarkToCell(this, null);
                } else {
                    markedCells[key] = selectedColor;
                    applyMarkToCell(this, selectedColor);
                }
                updateDeliriumMarkers();
                updateSecretRoomMarkers();
                updateUSRMarkers();
            });

            grid.appendChild(cell);
        }
    }

    // ── Clear ──

    clearBtn.addEventListener('click', function() {
        document.querySelectorAll('.cell').forEach(cell => {
            applyMarkToCell(cell, null);
            cell.classList.remove('boss-possible', 'boss-impossible', 'sr-candidate', 'ssr-candidate', 'usr-candidate');
            cell.querySelectorAll('.wall').forEach(w => w.classList.remove('wall-active', 'wall-blocked'));
        });
        markedCells = {};
        blockedWalls = new Set();
        updateDeliriumMarkers();
        updateSecretRoomMarkers();
        updateUSRMarkers();
    });

    // ── Download ──

    downloadBtn.addEventListener('click', function() {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const size = 520;
        const cellSize = size / 13;

        canvas.width = size;
        canvas.height = size;

        ctx.fillStyle = '#1e1e2e';
        ctx.fillRect(0, 0, size, size);

        ctx.strokeStyle = '#4cc9f0';
        ctx.lineWidth = 2;
        for (let i = 0; i <= 13; i++) {
            ctx.beginPath();
            ctx.moveTo(i * cellSize, 0);
            ctx.lineTo(i * cellSize, size);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(0, i * cellSize);
            ctx.lineTo(size, i * cellSize);
            ctx.stroke();
        }

        const colorMap = {
            white: '#ffffff',
            black: '#2d3436',
            red: '#e74c3c',
            skull: '#7f8c8d',
            other: '#f39c12',
            'empty-room': '#1a1a30',
            sr: '#808080',
            ssr: '#333333',
            usr: '#3a0000',
        };

        for (let row = 0; row < 13; row++) {
            for (let col = 0; col < 13; col++) {
                const key = `${row}-${col}`;
                const type = markedCells[key];
                if (!type) continue;

                const x = col * cellSize + 1;
                const y = row * cellSize + 1;
                const w = cellSize - 2;
                const h = cellSize - 2;

                ctx.fillStyle = colorMap[type] || '#ffffff';
                ctx.fillRect(x, y, w, h);

                const text = getCellText(type);
                if (text) {
                    ctx.font = `${type === 'empty-room' ? cellSize * 0.5 : cellSize * 0.6}px Arial`;
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';
                    ctx.fillStyle = type === 'empty-room' ? '#7070a8' : (type === 'sr' || type === 'ssr' || type === 'usr') ? '#ffffff' : '#000000';
                    ctx.fillText(text, x + w / 2, y + h / 2);
                }

                // Delirium indicator in exported image
                if (isVoidMode && type === 'skull') {
                    if (canBeDelirium(row, col)) {
                        ctx.strokeStyle = '#ffd700';
                        ctx.lineWidth = 3;
                        ctx.strokeRect(x + 1, y + 1, w - 2, h - 2);
                        ctx.font = `${cellSize * 0.28}px Arial`;
                        ctx.textAlign = 'right';
                        ctx.textBaseline = 'top';
                        ctx.fillStyle = '#ffd700';
                        ctx.fillText('⚠', x + w - 2, y + 2);
                    } else {
                        ctx.strokeStyle = 'rgba(0,0,0,0.55)';
                        ctx.lineWidth = 3;
                        ctx.beginPath();
                        ctx.moveTo(x + 5, y + 5);
                        ctx.lineTo(x + w - 5, y + h - 5);
                        ctx.moveTo(x + w - 5, y + 5);
                        ctx.lineTo(x + 5, y + h - 5);
                        ctx.stroke();
                    }
                    // reset stroke for next cell
                    ctx.strokeStyle = '#4cc9f0';
                    ctx.lineWidth = 2;
                }
            }
        }

        const link = document.createElement('a');
        link.download = `isaac_map_${new Date().toISOString().replace(/\D/g, '').slice(0, 14)}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
    });

    // ── Color selection ──

    colorOptions.forEach(option => {
        option.addEventListener('click', function() {
            selectedColor = this.dataset.color;
            colorOptions.forEach(opt => opt.classList.remove('selected'));
            this.classList.add('selected');
        });
    });

    // ── Navigation ──

    upBtn.addEventListener('click',    () => moveMarkedCells('up'));
    downBtn.addEventListener('click',  () => moveMarkedCells('down'));
    leftBtn.addEventListener('click',  () => moveMarkedCells('left'));
    rightBtn.addEventListener('click', () => moveMarkedCells('right'));

    function moveMarkedCells(direction) {
        const newMarkedCells = {};

        document.querySelectorAll('.cell').forEach(cell => {
            applyMarkToCell(cell, null);
            cell.classList.remove('boss-possible', 'boss-impossible', 'sr-candidate', 'ssr-candidate', 'usr-candidate');
            cell.querySelectorAll('.wall').forEach(w => w.classList.remove('wall-active', 'wall-blocked'));
        });

        for (const key in markedCells) {
            if (!markedCells.hasOwnProperty(key)) continue;
            const [row, col] = key.split('-').map(Number);
            let newRow = row, newCol = col;

            if (direction === 'up')    newRow--;
            if (direction === 'down')  newRow++;
            if (direction === 'left')  newCol--;
            if (direction === 'right') newCol++;

            if (newRow >= 0 && newRow < 13 && newCol >= 0 && newCol < 13) {
                const newKey = `${newRow}-${newCol}`;
                newMarkedCells[newKey] = markedCells[key];
                const cell = document.querySelector(`.cell[data-row="${newRow}"][data-col="${newCol}"]`);
                if (cell) applyMarkToCell(cell, markedCells[key]);
            }
        }

        const newBlockedWalls = new Set();
        for (const wallKey of blockedWalls) {
            const lastDash = wallKey.lastIndexOf('-');
            const dir = wallKey.slice(lastDash + 1);
            const [row, col] = wallKey.slice(0, lastDash).split('-').map(Number);
            let newRow = row, newCol = col;

            if (direction === 'up')    newRow--;
            if (direction === 'down')  newRow++;
            if (direction === 'left')  newCol--;
            if (direction === 'right') newCol++;

            if (newRow >= 0 && newRow < 13 && newCol >= 0 && newCol < 13) {
                newBlockedWalls.add(`${newRow}-${newCol}-${dir}`);
            }
        }

        markedCells = newMarkedCells;
        blockedWalls = newBlockedWalls;
        updateDeliriumMarkers();
        updateSecretRoomMarkers();
        updateUSRMarkers();
    }
});
