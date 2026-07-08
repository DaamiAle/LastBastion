/**
 * A spatial data structure that partitions space into a grid of cells.
 * Used for accelerating 2D proximity queries, like collision detection or AI target finding.
 */
export class SpatialHashGrid {
    /**
     * @param {number} cellSize The size of each grid square in pixels
     */
    constructor(cellSize) {
        /** @type {number} The width and height of each grid cell */
        this.cellSize = cellSize;
        
        /** @type {Map<string, Set<Object|number>>} Maps a cell key ("x,y") to a set of entities */
        this.cells = new Map();
    }

    /**
     * Clears all entities from the grid.
     * Must be called every frame before re-inserting active entities.
     */
    clear() {
        this.cells.clear();
    }

    /**
     * Inserts an entity into the cell corresponding to its current coordinates.
     * @param {Object|number} entity The entity (or entity ID) to insert
     * @param {number} x The X coordinate of the entity
     * @param {number} y The Y coordinate of the entity
     */
    insert(entity, x, y) {
        const key = this._key(x, y);

        if (!this.cells.has(key)) {
            this.cells.set(key, new Set());
        }

        this.cells.get(key).add(entity);
    }

    /**
     * Retrieves all entities that exist within cells intersecting the given radius.
     * This returns a broad-phase list of candidates that need exact distance checking.
     * @param {number} x The X coordinate of the query center
     * @param {number} y The Y coordinate of the query center
     * @param {number} radius The query radius in pixels
     * @returns {Set<Object|number>} A set of potential candidate entities
     */
    queryRadius(x, y, radius) {
        const minX = Math.floor((x - radius) / this.cellSize);
        const maxX = Math.floor((x + radius) / this.cellSize);
        const minY = Math.floor((y - radius) / this.cellSize);
        const maxY = Math.floor((y + radius) / this.cellSize);
        const result = new Set();

        for (let cx = minX; cx <= maxX; cx++) {
            for (let cy = minY; cy <= maxY; cy++) {
                const cell = this.cells.get(`${cx},${cy}`);
                if (!cell) continue;

                for (const entity of cell) {
                    result.add(entity);
                }
            }
        }

        return result;
    }

    /**
     * Computes the string key for a grid cell based on world coordinates.
     * @private
     * @param {number} x 
     * @param {number} y 
     * @returns {string} The cell key (e.g., "5,2")
     */
    _key(x, y) {
        return `${Math.floor(x / this.cellSize)},${Math.floor(y / this.cellSize)}`;
    }
}
