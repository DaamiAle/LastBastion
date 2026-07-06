export class World {
    constructor() {
        this.entities = new Map(); // entityId -> Map(ComponentClass -> instance)
        this.systems = [];
        this.nextEntityId = 1;
        this.entitiesToDestroy = new Set();
    }

    createEntity() {
        const id = this.nextEntityId++;
        this.entities.set(id, new Map());
        return id;
    }

    destroyEntity(entityId) {
        this.entitiesToDestroy.add(entityId);
    }

    addComponent(entityId, component) {
        const components = this.entities.get(entityId);
        if (components) {
            components.set(component.constructor, component);
        }
    }

    removeComponent(entityId, componentClass) {
        const components = this.entities.get(entityId);
        if (!components) return;

        if (components.delete(componentClass)) return;

        const keyToDelete = Array.from(components.keys()).find(k => k.name === componentClass.name);
        if (keyToDelete) {
            components.delete(keyToDelete);
        }
    }

    getComponent(entityId, componentClass) {
        const components = this.entities.get(entityId);
        if (!components) return undefined;
        let comp = components.get(componentClass);
        if (!comp) {
            comp = Array.from(components.values()).find(c => c.constructor.name === componentClass.name);
        }
        return comp;
    }

    hasComponent(entityId, componentClass) {
        const components = this.entities.get(entityId);
        if (!components) return false;
        if (components.has(componentClass)) return true;
        return Array.from(components.values()).some(c => c.constructor.name === componentClass.name);
    }

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

    getSystem(systemName) {
        return this.systems.find(sys => sys.constructor.name === systemName);
    }

    addSystem(system) {
        this.systems.push(system);
    }

    update(delta) {
        for (const system of this.systems) {
            system.update(delta);
        }

        // Cleanup destroyed entities
        for (const entityId of this.entitiesToDestroy) {
            this.entities.delete(entityId);
        }
        this.entitiesToDestroy.clear();
    }

    clear() {
        this.entities.clear();
        this.entitiesToDestroy.clear();
    }
}
