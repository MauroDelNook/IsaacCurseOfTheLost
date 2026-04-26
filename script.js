document.addEventListener('DOMContentLoaded', function() {
    const grid = document.getElementById('grid');
    const clearBtn = document.getElementById('clear-btn');
    const downloadBtn = document.getElementById('download-btn');
    const colorOptions = document.querySelectorAll('.color-option');
    const githubLink = document.getElementById('github-link');
    const voidToggle = document.getElementById('void-toggle');
    const upBtn = document.getElementById('up-btn');
    const downBtn = document.getElementById('down-btn');
    const leftBtn = document.getElementById('left-btn');
    const rightBtn = document.getElementById('right-btn');

    let selectedColor = 'white';
    let markedCells = {};
    let isVoidMode = false;

    githubLink.href = 'https://github.com/MauroDelNook';
    githubLink.textContent = 'MauroDelNook';

    const ALL_MARK_CLASSES = [
        'marked-white', 'marked-black', 'marked-red',
        'marked-skull', 'marked-other', 'marked-empty-room'
    ];

    function getCellText(color) {
        if (color === 'skull') return '💀';
        if (color === 'other') return '★';
        if (color === 'empty-room') return '✕';
        return '';
    }

    function applyMarkToCell(cell, color) {
        cell.classList.remove(...ALL_MARK_CLASSES);
        if (color) {
            cell.classList.add(`marked-${color}`);
            cell.textContent = getCellText(color);
        } else {
            cell.textContent = '';
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

    voidToggle.addEventListener('change', function() {
        isVoidMode = this.checked;
        document.getElementById('void-info').style.display = isVoidMode ? 'block' : 'none';
        updateDeliriumMarkers();
    });

    // ── Grid creation ──

    for (let row = 0; row < 13; row++) {
        for (let col = 0; col < 13; col++) {
            const cell = document.createElement('div');
            cell.className = 'cell';
            cell.dataset.row = row;
            cell.dataset.col = col;

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
            });

            grid.appendChild(cell);
        }
    }

    // ── Clear ──

    clearBtn.addEventListener('click', function() {
        document.querySelectorAll('.cell').forEach(cell => {
            applyMarkToCell(cell, null);
            cell.classList.remove('boss-possible', 'boss-impossible');
        });
        markedCells = {};
        updateDeliriumMarkers();
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
            'empty-room': '#1a1a30'
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
                    ctx.fillStyle = type === 'empty-room' ? '#7070a8' : '#000000';
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
        link.download = 'isaac_map.png';
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
            cell.classList.remove('boss-possible', 'boss-impossible');
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

        markedCells = newMarkedCells;
        updateDeliriumMarkers();
    }
});
