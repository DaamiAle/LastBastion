import { Lifecycle } from '../core/Lifecycle.js';

export class Scene extends Lifecycle {
    constructor(runtime) {
        super();

        this.runtime = runtime;

        this.entities = [];
        this.systems = [];
    }

    addEntity(entity) {
        this.entities.push(entity);
        return entity;
    }

    addSystem(system) {
        this.systems.push(system);
        return system;
    }

    update(delta) {
        // 1. lógica opcional de entidades
        for (const e of this.entities) {
            if (e.active && e.update) {
                e.update(delta);
            }
        }

        // 2. systems
        for (const system of this.systems) {
            system.update(this.entities, delta);
        }
    }

    destroy() {
        for (const e of this.entities) {
            const sprite = e.get?.(Sprite);

            if (sprite?.view) {
                sprite.view.destroy();
                sprite.view = null;
            }
        }

        this.entities.length = 0;
        this.systems.length = 0;
    }
}