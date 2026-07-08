/**
 * The core Entity-Component-System (ECS) World manager.
 * Handles entity creation, component assignment, and system execution.
 */
export class World {
    constructor() {
        /** @type {Map<number, Map<Function, Object>>} Maps entity IDs to their components */
        this.entities = new Map();
        
        /** @type {Array<Object>} List of registered systems */
        this.systems = [];
        
        /** @type {number} The next available numeric entity ID */
        this.nextEntityId = 1;
        
        /** @type {Set<number>} Set of entity IDs queued for destruction at the end of the frame */
        this.entitiesToDestroy = new Set();
    }

    /**
     * Creates a new entity and returns its unique ID.
     * @returns {number} The new entity ID
     */
    createEntity() {
        const id = this.nextEntityId++;
        this.entities.set(id, new Map());
        return id;
    }

    /**
     * Queues an entity for destruction at the end of the current update cycle.
     * @param {number} entityId The ID of the entity to destroy
     */
    destroyEntity(entityId) {
        this.entitiesToDestroy.add(entityId);
    }

    /**
     * Adds a component instance to an entity.
     * @param {number} entityId The target entity ID
     * @param {Object} component The component instance
     */
    addComponent(entityId, component) {
        const components = this.entities.get(entityId);
        if (components) {
            components.set(component.constructor, component);
        }
    }

    /**
     * Removes a specific component type from an entity.
     * @param {number} entityId The target entity ID
     * @param {Function} componentClass The class constructor of the component to remove
     */
    removeComponent(entityId, componentClass) {
        const components = this.entities.get(entityId);
        if (!components) return;

        if (components.delete(componentClass)) return;

        // Fallback for minification/bundling mismatch
        const keyToDelete = Array.from(components.keys()).find(k => k.name === componentClass.name);
        if (keyToDelete) {
            components.delete(keyToDelete);
        }
    }

    /**
     * Gets a specific component instance from an entity.
     * @param {number} entityId The entity ID
     * @param {Function} componentClass The class constructor of the desired component
     * @returns {Object|undefined} The component instance, or undefined if not found
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
     * Checks if an entity possesses a specific component type.
     * @param {number} entityId The entity ID
     * @param {Function} componentClass The class constructor to check for
     * @returns {boolean} True if the entity has the component
     */
    hasComponent(entityId, componentClass) {
        const components = this.entities.get(entityId);
        if (!components) return false;
        if (components.has(componentClass)) return true;
        return Array.from(components.values()).some(c => c.constructor.name === componentClass.name);
    }

    /**
     * Queries the world for all entities that possess a given set of components.
     * @param {...Function} componentClasses A variable number of component class constructors
     * @returns {Array<number>} An array of matching entity IDs
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
     * Retrieves a registered system by its class name.
     * @param {string} systemName The name of the system class
     * @returns {Object|undefined} The system instance
     */
    getSystem(systemName) {
        return this.systems.find(sys => sys.constructor.name === systemName);
    }

    /**
     * Registers a new system to be executed during the update loop.
     * @param {Object} system The system instance
     */
    addSystem(system) {
        this.systems.push(system);
    }

    /**
     * Executes all registered systems and cleans up destroyed entities.
     * @param {Object} delta Time delta object
     */
    update(delta) {
        for (const system of this.systems) {
            system.update(delta);
        }

        // Cleanup destroyed entities after all systems have processed
        for (const entityId of this.entitiesToDestroy) {
            this.entities.delete(entityId);
        }
        this.entitiesToDestroy.clear();
    }

    /**
     * Wipes all entities from the world. Systems are preserved.
     */
    clear() {
        this.entities.clear();
        this.entitiesToDestroy.clear();
    }
}
