/**
 * El administrador (manager) principal del Mundo (World) Entidad-Componente-Sistema (ECS).
 * Maneja la creación de entidades, asignación de componentes y ejecución de sistemas.
 */
export class World {
    constructor() {
        /** @type {Map<number, Map<Function, Object>>} Mapea los IDs de entidad a sus componentes */
        this.entities = new Map();
        
        /** @type {Array<Object>} Lista de sistemas registrados */
        this.systems = [];
        
        /** @type {number} El siguiente ID numérico de entidad disponible */
        this.nextEntityId = 1;
        
        /** @type {Set<number>} Conjunto de IDs de entidad en cola para destrucción al final del fotograma */
        this.entitiesToDestroy = new Set();
    }

    /**
     * Crea una nueva entidad y devuelve su ID único.
     * @returns {number} El nuevo ID de entidad
     */
    createEntity() {
        const id = this.nextEntityId++;
        this.entities.set(id, new Map());
        return id;
    }

    /**
     * Comprueba si un ID de entidad existe en el mundo y no está en cola para destrucción.
     * @param {number} entityId El ID de la entidad a comprobar
     * @returns {boolean} Verdadero si la entidad existe
     */
    hasEntity(entityId) {
        return this.entities.has(entityId) && !this.entitiesToDestroy.has(entityId);
    }

    /**
     * Pone una entidad en cola para su destrucción al final del ciclo de actualización actual.
     * @param {number} entityId El ID de la entidad a destruir
     */
    destroyEntity(entityId) {
        this.entitiesToDestroy.add(entityId);
    }

    /**
     * Añade una instancia de componente a una entidad.
     * @param {number} entityId El ID de la entidad objetivo
     * @param {Object} component La instancia del componente
     */
    addComponent(entityId, component) {
        const components = this.entities.get(entityId);
        if (components) {
            components.set(component.constructor, component);
        }
    }

    /**
     * Elimina un tipo específico de componente de una entidad.
     * @param {number} entityId El ID de la entidad objetivo
     * @param {Function} componentClass El constructor de clase del componente a eliminar
     */
    removeComponent(entityId, componentClass) {
        const components = this.entities.get(entityId);
        if (!components) return;

        if (components.delete(componentClass)) return;

        // Alternativa (fallback) para desajuste (mismatch) por minificación/empaquetado
        const keyToDelete = Array.from(components.keys()).find(k => k.name === componentClass.name);
        if (keyToDelete) {
            components.delete(keyToDelete);
        }
    }

    /**
     * Obtiene una instancia específica de componente de una entidad.
     * @param {number} entityId El ID de la entidad
     * @param {Function} componentClass El constructor de clase del componente deseado
     * @returns {Object|undefined} La instancia del componente, o indefinido (undefined) si no se encuentra
     */
    getComponent(entityId, componentClass) {
        const components = this.entities.get(entityId);
        if (!components) return undefined;
        let comp = components.get(componentClass);
        if (!comp) {
            comp = Array.from(components.values()).find(c => c.constructor.name === componentClass.name);
        }
        return comp;
    }

    /**
     * Comprueba si una entidad posee un tipo específico de componente.
     * @param {number} entityId El ID de la entidad
     * @param {Function} componentClass El constructor de clase a comprobar
     * @returns {boolean} Verdadero si la entidad tiene el componente
     */
    hasComponent(entityId, componentClass) {
        const components = this.entities.get(entityId);
        if (!components) return false;
        if (components.has(componentClass)) return true;
        return Array.from(components.values()).some(c => c.constructor.name === componentClass.name);
    }

    /**
     * Consulta al mundo por todas las entidades que poseen un conjunto dado de componentes.
     * @param {...Function} componentClasses Un número variable de constructores de clase de componentes
     * @returns {Array<number>} Un array con los IDs de las entidades que coinciden
     */
    getEntitiesWith(...componentClasses) {
        const result = [];
        for (const [entityId, components] of this.entities.entries()) {
            if (this.entitiesToDestroy.has(entityId)) continue;
            
            let hasAll = true;
            for (const componentClass of componentClasses) {
                let found = components.has(componentClass);
                if (!found) {
                    found = Array.from(components.values()).some(c => c.constructor.name === componentClass.name);
                }
                if (!found) {
                    hasAll = false;
                    break;
                }
            }
            if (hasAll) {
                result.push(entityId);
            }
        }
        return result;
    }

    /**
     * Recupera un sistema registrado por el nombre de su clase.
     * @param {string} systemName El nombre de la clase del sistema
     * @returns {Object|undefined} La instancia del sistema
     */
    getSystem(systemName) {
        return this.systems.find(sys => sys.constructor.name === systemName);
    }

    /**
     * Registra un nuevo sistema para ser ejecutado durante el bucle de actualización.
     * @param {Object} system La instancia del sistema
     */
    addSystem(system) {
        this.systems.push(system);
    }

    /**
     * Ejecuta todos los sistemas registrados y limpia (cleanup) las entidades destruidas.
     * @param {Object} delta Objeto de delta de tiempo
     */
    update(delta) {
        for (const system of this.systems) {
            system.update(delta);
        }

        // Limpiar las entidades destruidas después de que todos los sistemas las hayan procesado
        for (const entityId of this.entitiesToDestroy) {
            this.entities.delete(entityId);
        }
        this.entitiesToDestroy.clear();
    }

    /**
     * Borra (wipes) todas las entidades del mundo. Los sistemas se conservan.
     */
    clear() {
        this.entities.clear();
        this.entitiesToDestroy.clear();
    }
}
