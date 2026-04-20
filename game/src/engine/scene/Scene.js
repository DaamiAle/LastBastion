import { SpatialHashGrid } from '../spatial/SpatialHashGrid.js';
import { Transform } from '../world/components/Transform.js';

export class Scene {
    constructor() {
        this.entities = [];
        this.systems = [];

        this.grid = new SpatialHashGrid(300); // tamaño de celda configurable
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
        // =========================
        // 1. REBUILD GRID
        // =========================
        this.grid.clear();

        for (const e of this.entities) {
            if (!e.active) continue;

            const t = e.get(Transform);
            if (!t) continue;

            this.grid.insert(e, t.position.x, t.position.y);
        }

        // =========================
        // 2. SYSTEMS UPDATE
        // =========================
        for (const system of this.systems) {
            system.update(this.entities, delta);
        }
    }
}