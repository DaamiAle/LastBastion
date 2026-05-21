/**
 * ResourceManager
 * 
 * Gestor centralizado de recursos (assets).
 * 
 * Responsabilidades:
 * - Carga de assets bajo demanda
 * - Cache de assets
 * - Reference counting
 * - Liberación automática cuando no se necesitan
 * - Evitar duplicación de assets en memoria
 */

export class ResourceManager {
    constructor(assetLoader) {
        this.assetLoader = assetLoader;

        // Map<resourceId, resourceData>
        this.cache = new Map();

        // Map<resourceId, refCount>
        this.referenceCount = new Map();

        // Map<resourceType, Set<resourceId>>
        this.typeIndex = new Map();

        // Estadísticas
        this.stats = {
            loaded: 0,
            unloaded: 0,
            cached: 0
        };
    }

    /**
     * Cargar un recurso
     * @param {string} id - Identificador único
     * @param {string} path - Ruta del asset
     * @param {Object} options - Opciones (type, etc)
     */
    async load(id, path, options = {}) {
        const { type = 'unknown' } = options;

        // Si ya está cacheado, incrementar referencia
        if (this.cache.has(id)) {
            this._incrementRef(id);
            return this.cache.get(id);
        }

        // Cargar desde AssetLoader
        const asset = await this.assetLoader.load(id, path);

        // Guardar en cache
        this.cache.set(id, asset);
        this._incrementRef(id);

        // Indexar por tipo
        if (!this.typeIndex.has(type)) {
            this.typeIndex.set(type, new Set());
        }
        this.typeIndex.get(type).add(id);

        this.stats.loaded++;
        this.stats.cached = this.cache.size;

        return asset;
    }

    /**
     * Obtener recurso ya cargado
     * @param {string} id
     */
    get(id) {
        return this.cache.get(id);
    }

    /**
     * Verificar si recurso está cargado
     * @param {string} id
     */
    has(id) {
        return this.cache.has(id);
    }

    /**
     * Descargar recurso
     * Decrementa reference count y libera si llega a 0
     * @param {string} id
     */
    unload(id) {
        if (!this.cache.has(id)) {
            console.warn(`ResourceManager: Recurso "${id}" no encontrado`);
            return;
        }

        this._decrementRef(id);

        // Si ref count llegó a 0, eliminar del cache
        const refCount = this.referenceCount.get(id);
        if (refCount <= 0) {
            this._removeResource(id);
            this.stats.unloaded++;
        }

        this.stats.cached = this.cache.size;
    }

    /**
     * Liberar todos los recursos de un tipo
     * @param {string} type
     */
    unloadByType(type) {
        const resources = this.typeIndex.get(type);
        if (!resources) return;

        for (const id of resources) {
            this.unload(id);
        }
    }

    /**
     * Liberar todos los recursos
     */
    unloadAll() {
        const ids = Array.from(this.cache.keys());
        for (const id of ids) {
            const refCount = this.referenceCount.get(id);
            // Forzar descarga (setear refCount a 1 para que se elimine)
            this.referenceCount.set(id, 1);
            this.unload(id);
        }
    }

    /**
     * Incrementar reference count
     * @internal
     */
    _incrementRef(id) {
        const current = this.referenceCount.get(id) || 0;
        this.referenceCount.set(id, current + 1);
    }

    /**
     * Decrementar reference count
     * @internal
     */
    _decrementRef(id) {
        const current = this.referenceCount.get(id) || 1;
        this.referenceCount.set(id, Math.max(0, current - 1));
    }

    /**
     * Remover recurso del cache
     * @internal
     */
    _removeResource(id) {
        this.cache.delete(id);
        this.referenceCount.delete(id);

        // Remover del índice de tipos
        for (const [type, resources] of this.typeIndex) {
            resources.delete(id);
            if (resources.size === 0) {
                this.typeIndex.delete(type);
            }
        }
    }

    /**
     * Obtener estadísticas
     */
    getStats() {
        return { ...this.stats };
    }

    /**
     * Limpiar todo
     */
    clear() {
        this.unloadAll();
    }

    /**
     * Obtener tamaño del cache
     */
    get size() {
        return this.cache.size;
    }
}
