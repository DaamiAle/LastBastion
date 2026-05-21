/**
 * World
 * 
 * Núcleo del ECS.
 * Responsabilidades:
 * - Gestionar entidades
 * - Gestionar componentes  
 * - Ejecutar sistemas
 * - Mantener queries
 * - Manejar eventos
 * 
 * World NO se ocupa de:
 * - Carga de assets
 * - Transiciones de escena
 * - Gameplay específico
 */

import { EventBus } from '../events/EventBus.js';
import { QueryManager } from '../ecs/query/QueryManager.js';
import { SpatialHashGrid } from '../spatial/SpatialHashGrid.js';
import { Transform } from '../world/components/Transform.js';

export class World {
    constructor() {
        // Datos
        this.entities = [];
        this.systems = [];

        // Servicios
        this.eventBus = new EventBus();
        this.queryManager = new QueryManager();
        this.grid = new SpatialHashGrid(300);
    }

    /**
     * Crear query de entidades
     */
    query(componentTypes) {
        return this.queryManager.query(componentTypes);
    }

    /**
     * Agregar entidad al mundo
     */
    addEntity(entity) {
        // Registrar QueryManager en la entidad
        entity.setQueryManager(this.queryManager);
        
        // Indexar componentes existentes
        for (const component of entity.components.values()) {
            this.queryManager.addComponentToIndex(entity, component.constructor);
        }
        
        this.entities.push(entity);
        return entity;
    }

    /**
     * Remover entidad del mundo
     */
    removeEntity(entity) {
        const idx = this.entities.indexOf(entity);
        if (idx >= 0) {
            this.entities.splice(idx, 1);
            if (typeof entity.destroy === 'function') entity.destroy();
        }
    }

    /**
     * Agregar sistema al mundo
     */
    addSystem(system, priority = 0) {
        system.priority = priority;
        this.systems.push(system);
        this.systems.sort((a, b) => a.priority - b.priority);
        return system;
    }

    /**
     * Activar/desactivar todas las entidades
     */
    setAllEntitiesActive(active) {
        for (const e of this.entities) {
            e.active = active;
        }
    }

    /**
     * Actualizar el mundo
     */
    update(delta) {
        // =========================
        // 1. REBUILD SPATIAL GRID
        // =========================
        this.grid.clear();

        for (const e of this.entities) {
            if (!e.active) continue;

            const t = e.get(Transform);
            if (!t) continue;

            this.grid.insert(e, t.position.x, t.position.y);
        }

        // =========================
        // 2. UPDATE SYSTEMS
        // =========================
        for (const system of this.systems) {
            system.update(this.entities, delta, this);
        }
    }

    /**
     * Limpiar mundo
     */
    destroy() {
        // Destruir todos los sistemas
        for (const system of this.systems) {
            if (typeof system.destroy === 'function') {
                system.destroy();
            }
        }

        // Limpiar entidades
        this.entities.forEach(e => e.destroy?.());
        this.entities.clear();
        
        // Limpiar servicios
        this.eventBus.clear();
        this.queryManager.clear();
        this.grid.clear();
    }
}
