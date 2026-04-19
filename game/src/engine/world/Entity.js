export class Entity {
    constructor() {
        this.components = new Map();
        this.active = true;
    }

    add(component) {
        this.components.set(component.constructor.name, component);
        return this;
    }

    get(componentClass) {
        return this.components.get(componentClass.name);
    }

    has(componentClass) {
        return this.components.has(componentClass.name);
    }

    remove(componentClass) {
        this.components.delete(componentClass.name);
    }
}