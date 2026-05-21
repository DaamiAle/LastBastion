/**
 * CollisionSystem
 * 
 * Detecta colisiones entre entidades.
 * Emite eventos en lugar de llamar callbacks.
 * Los systems se comunican mediante el EventBus.
 */

import { Transform } from '../world/components/Transform.js';
import { CircleCollider } from '../world/components/colliders/CircleCollider.js';
import { BoxCollider } from '../world/components/colliders/BoxCollider.js';
import { areCollidersColliding } from './collision/CollisionDispatcher.js';
import { CollisionEvents } from '../events/EventTypes.js';

export class CollisionSystem {
    /**
     * @param {Object} matrix - Matriz de colisiones
     * @param {SpatialHashGrid} grid - Grid espacial
     * @param {EventBus} eventBus - Bus de eventos de la escena
     */
    constructor(matrix, grid, eventBus = null) {
        this.matrix = matrix;
        this.grid = grid;
        this.eventBus = eventBus;

        this.previous = new Set();
        this.current = new Set();
    }

    /**
     * Establecer el event bus (si no se pasó en constructor)
     */
    setEventBus(eventBus) {
        this.eventBus = eventBus;
    }

    update(entities) {
        this.current.clear();

        // índice por id (evita find O(n))
        const entityMap = new Map();
        for (const e of entities) {
            entityMap.set(e.id, e);
        }

        for (const a of entities) {
            if (!a.active) continue;

            const ta = a.get(Transform);
            if (!ta) continue;

            const ca = a.get(CircleCollider) || a.get(BoxCollider);
            if (!ca) continue;

            // Determinar radio para la consulta espacial según tipo de collider
            let radius;
            if (ca.type === 'circle') {
                radius = ca.radius;
            } else if (ca.type === 'box') {
                radius = Math.max(ca.width || 0, ca.height || 0) / 2;
            } else {
                radius = 100;
            }

            const neighbors = this.grid.queryRadius(
                ta.position.x,
                ta.position.y,
                radius
            );

            for (const b of neighbors) {
                if (a === b || !b.active) continue;
                if (a.id >= b.id) continue;

                const tb = b.get(Transform);
                if (!tb) continue;

                const cb = b.get(CircleCollider) || b.get(BoxCollider);
                if (!cb) continue;

                // permitir flag para ignorar colisiones dinámicamente
                if (ca.noCollide || cb.noCollide) continue;

                if (!this.canCollide(ca.layer, cb.layer)) continue;

                if (areCollidersColliding(ca, ta, cb, tb)) {
                    const id = this.getPairId(a, b);

                    this.current.add(id);

                    if (!this.previous.has(id)) {
                        this.onEnter(a, b);
                    } else {
                        this.onStay(a, b);
                    }
                }
            }
        }

        // EXIT
        for (const id of this.previous) {
            if (!this.current.has(id)) {
                const [aId, bId] = id.split(':').map(Number);
                const a = entityMap.get(aId);
                const b = entityMap.get(bId);

                if (a && b) this.onExit(a, b);
            }
        }

        this.previous = new Set(this.current);
    }

    getPairId(a, b) {
        return a.id < b.id
            ? `${a.id}:${b.id}`
            : `${b.id}:${a.id}`;
    }

    canCollide(a, b) {
        return this.matrix[a]?.[b]?.collide ?? false;
    }

    /**
     * Emitir evento de collision.enter
     */
    onEnter(a, b) {
        // Mantener compatibilidad con callbacks antiguos si existen
        if (typeof a.onCollisionEnter === 'function') a.onCollisionEnter(b);
        if (typeof b.onCollisionEnter === 'function') b.onCollisionEnter(a);

        // Emitir evento en event bus
        if (this.eventBus) {
            this.eventBus.emit(CollisionEvents.ENTER, {
                entityA: a,
                entityB: b
            });
        }
    }

    /**
     * Emitir evento de collision.stay
     */
    onStay(a, b) {
        // Mantener compatibilidad con callbacks antiguos si existen
        if (typeof a.onCollisionStay === 'function') a.onCollisionStay(b);
        if (typeof b.onCollisionStay === 'function') b.onCollisionStay(a);

        // Emitir evento en event bus
        if (this.eventBus) {
            this.eventBus.emit(CollisionEvents.STAY, {
                entityA: a,
                entityB: b
            });
        }
    }

    /**
     * Emitir evento de collision.exit
     */
    onExit(a, b) {
        // Mantener compatibilidad con callbacks antiguos si existen
        if (typeof a.onCollisionExit === 'function') a.onCollisionExit(b);
        if (typeof b.onCollisionExit === 'function') b.onCollisionExit(a);

        // Emitir evento en event bus
        if (this.eventBus) {
            this.eventBus.emit(CollisionEvents.EXIT, {
                entityA: a,
                entityB: b
            });
        }
    }
}