/**
 * Query
 * 
 * Representa una consulta de entidades que cumplen ciertos componentes.
 * Permite iterar solo sobre entidades relevantes.
 */

export class Query {
    /**
     * @param {Class[]} componentTypes - Array de clases de componentes requeridos
     * @param {Map<string, Set<Entity>>} indexByComponent - Índice de entidades por componente
     */
    constructor(componentTypes, indexByComponent) {
        this.componentTypes = componentTypes;
        this.indexByComponent = indexByComponent;
        this._cache = null;
        this._cacheValid = false;
    }

    /**
     * Obtener todas las entidades que cumplen la query (con caching)
     */
    get entities() {
        if (!this._cacheValid) {
            this._cache = this._compute();
            this._cacheValid = true;
        }
        return this._cache;
    }

    /**
     * Computar entidades que tienen TODOS los componentes
     */
    _compute() {
        if (this.componentTypes.length === 0) {
            return [];
        }

        // Empezar con el componente que tiene menos entidades
        let smallest = null;
        let smallestSize = Infinity;

        for (const componentType of this.componentTypes) {
            const name = componentType.name;
            const entities = this.indexByComponent.get(name);
            if (!entities) return [];

            if (entities.size < smallestSize) {
                smallest = entities;
                smallestSize = entities.size;
            }
        }

        // Intersectar con los otros
        const result = [];
        for (const entity of smallest) {
            let hasAll = true;
            for (const componentType of this.componentTypes) {
                if (!entity.has(componentType)) {
                    hasAll = false;
                    break;
                }
            }
            if (hasAll) {
                result.push(entity);
            }
        }

        return result;
    }

    /**
     * Iterar sobre entidades (syntax sugar)
     */
    forEach(callback) {
        this.entities.forEach(callback);
    }

    /**
     * Invalidar cache (llamado por QueryManager cuando hay cambios)
     */
    invalidateCache() {
        this._cacheValid = false;
    }

    /**
     * Obtener contador de resultados
     */
    get count() {
        return this.entities.length;
    }

    /**
     * Obtener primera entidad
     */
    get first() {
        return this.entities[0] || null;
    }
}
