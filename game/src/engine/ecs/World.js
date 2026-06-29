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
        if (components) {
            components.delete(componentClass);
        }
    }

    getComponent(entityId, componentClass) {
        const components = this.entities.get(entityId);
        return components ? components.get(componentClass) : undefined;
    }

    hasComponent(entityId, componentClass) {
        const components = this.entities.get(entityId);
        return components ? components.has(componentClass) : false;
    }

    getEntitiesWith(...componentClasses) {
        const result = [];
        for (const [entityId, components] of this.entities.entries()) {
            if (this.entitiesToDestroy.has(entityId)) continue;
            
            let hasAll = true;
            for (const componentClass of componentClasses) {
                if (!components.has(componentClass)) {
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
}
