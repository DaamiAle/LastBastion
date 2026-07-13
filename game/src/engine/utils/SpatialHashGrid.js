/**
 * Una estructura de datos espacial que divide el espacio en una cuadrícula (grid) de celdas.
 * Se utiliza para acelerar las consultas de proximidad 2D, como la detección de colisiones o la búsqueda de objetivos por IA.
 */
export class SpatialHashGrid {
    /**
     * @param {number} cellSize El tamaño de cada celda de la cuadrícula en píxeles
     */
    constructor(cellSize) {
        /** @type {number} El ancho y alto de cada celda de la cuadrícula */
        this.cellSize = cellSize;
        
        /** @type {Map<string, Set<Object|number>>} Mapea una clave de celda ("x,y") a un conjunto de entidades */
        this.cells = new Map();
    }

    /**
     * Borra todas las entidades de la cuadrícula.
     * Debe llamarse en cada fotograma antes de reinsertar las entidades activas.
     */
    clear() {
        this.cells.clear();
    }

    /**
     * Inserta una entidad en la celda correspondiente a sus coordenadas actuales.
     * @param {Object|number} entity La entidad (o ID de entidad) a insertar
     * @param {number} x La coordenada X de la entidad
     * @param {number} y La coordenada Y de la entidad
     */
    insert(entity, x, y) {
        const key = this._key(x, y);

        if (!this.cells.has(key)) {
            this.cells.set(key, new Set());
        }

        this.cells.get(key).add(entity);
    }

    /**
     * Recupera todas las entidades que existen dentro de celdas que intersectan el radio dado.
     * Esto devuelve una lista de candidatos de fase amplia (broad-phase) que necesitan comprobación de distancia exacta.
     * @param {number} x La coordenada X del centro de consulta
     * @param {number} y La coordenada Y del centro de consulta
     * @param {number} radius El radio de consulta en píxeles
     * @returns {Set<Object|number>} Un conjunto de entidades candidatas potenciales
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
     * Calcula la clave (string key) para una celda de la cuadrícula basándose en las coordenadas del mundo.
     * @private
     * @param {number} x 
     * @param {number} y 
     * @returns {string} La clave de la celda (ej., "5,2")
     */
    _key(x, y) {
        return `${Math.floor(x / this.cellSize)},${Math.floor(y / this.cellSize)}`;
    }
}
