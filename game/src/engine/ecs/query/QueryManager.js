/**
 * QueryManager
 * 
 * Mantiene índices de componentes.
 * Crea y cachea queries.
 * Invalida caches cuando hay cambios.
 */

import { Query } from './Query.js';

export class QueryManager {
    constructor() {
        // Map<componentName, Set<Entity>>
        this.indexByComponent = new Map();

        // Map<querySignature, Query>
        this.queryCache = new Map();
    }

    /**
     * Registrar que una entidad tiene un componente
     * @internal
     */
    addComponentToIndex(entity, componentClass) {
        const name = componentClass.name;
        console.log(`QueryManager: indexing entity ${entity.id} with component: "${name}"`);
        if (!this.indexByComponent.has(name)) {
            this.indexByComponent.set(name, new Set());
        }
        this.indexByComponent.get(name).add(entity);
        this._invalidateRelatedQueries(name);
    }

    /**
     * Desregistrar que una entidad tiene un componente
     * @internal
     */
    removeComponentFromIndex(entity, componentClass) {
        const name = componentClass.name;
        if (this.indexByComponent.has(name)) {
            this.indexByComponent.get(name).delete(entity);
        }
        this._invalidateRelatedQueries(name);
    }

    /**
     * Crear o obtener query
     * @param {Class[]} componentTypes - Array de clases de componentes
     * @returns {Query}
     */
    query(componentTypes) {
        // Crear firma de query (para caching)
        const signature = componentTypes
            .map(c => c.name)
            .sort()
            .join('|');

        if (this.queryCache.has(signature)) {
            return this.queryCache.get(signature);
        }

        // Crear nueva query
        const query = new Query(componentTypes, this.indexByComponent);
        this.queryCache.set(signature, query);
        return query;
    }

    /**
     * Invalidar queries que dependen de un componente
     * @internal
     */
    _invalidateRelatedQueries(componentName) {
        for (const query of this.queryCache.values()) {
            for (const componentType of query.componentTypes) {
                if (componentType.name === componentName) {
                    query.invalidateCache();
                    break;
                }
            }
        }
    }

    /**
     * Limpiar todo (al destruir escena)
     */
    clear() {
        this.indexByComponent.clear();
        this.queryCache.clear();
    }
}
