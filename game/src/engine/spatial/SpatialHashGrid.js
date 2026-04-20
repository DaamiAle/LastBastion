export class SpatialHashGrid {
    constructor(cellSize = 100) {
        this.cellSize = cellSize;
        this.cells = new Map(); // key -> Set<entity>
    }

    // =========================
    // PUBLIC API
    // =========================

    insert(entity, x, y) {
        const key = this._key(x, y);

        if (!this.cells.has(key)) {
            this.cells.set(key, new Set());
        }

        this.cells.get(key).add(entity);
    }

    query(x, y) {
        const key = this._key(x, y);
        return this.cells.get(key) || EMPTY_SET;
    }

    queryNearby(x, y) {
        const cx = this._cell(x);
        const cy = this._cell(y);

        const result = new Set();

        for (let dx = -1; dx <= 1; dx++) {
            for (let dy = -1; dy <= 1; dy++) {
                const key = `${cx + dx},${cy + dy}`;
                const cell = this.cells.get(key);

                if (!cell) continue;

                for (const e of cell) {
                    result.add(e);
                }
            }
        }

        return result;
    }

    queryRadius(x, y, radius) {
        const minX = Math.floor((x - radius) / this.cellSize);
        const maxX = Math.floor((x + radius) / this.cellSize);
        const minY = Math.floor((y - radius) / this.cellSize);
        const maxY = Math.floor((y + radius) / this.cellSize);

        const result = new Set();

        for (let cx = minX; cx <= maxX; cx++) {
            for (let cy = minY; cy <= maxY; cy++) {
                const key = `${cx},${cy}`;
                const cell = this.cells.get(key);

                if (!cell) continue;

                for (const e of cell) {
                    result.add(e);
                }
            }
        }

        return result;
    }

    clear() {
        this.cells.clear();
    }

    // =========================
    // INTERNAL
    // =========================

    _cell(value) {
        return Math.floor(value / this.cellSize);
    }

    _key(x, y) {
        return `${this._cell(x)},${this._cell(y)}`;
    }
}

const EMPTY_SET = new Set();