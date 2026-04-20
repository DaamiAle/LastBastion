// engine/system/CollisionSystem.js

import { Transform } from '../world/components/Transform.js';
import { CircleCollider } from '../world/components/colliders/CircleCollider.js';
import { BoxCollider } from '../world/components/colliders/BoxCollider.js';
import { areCollidersColliding } from './collision/CollisionDispatcher.js';

export class CollisionSystem {
    constructor(matrix, grid) {
        this.matrix = matrix;
        this.grid = grid;

        this.previous = new Set();
        this.current = new Set();
    }

    update(entities) {
        this.current.clear();

        for (const a of entities) {
            const ta = a.get(Transform);
            if (!ta) continue;

            let ca = a.get(CircleCollider) || a.get(BoxCollider);
            if (!ca) continue;

            const neighbors = this.grid.queryRadius(
                ta.position.x,
                ta.position.y,
                150
            );

            for (const b of neighbors) {
                if (a === b) continue;
                if (a.id >= b.id) continue;

                const tb = b.get(Transform);
                if (!tb) continue;

                let cb = b.get(CircleCollider) || b.get(BoxCollider);
                if (!cb) continue;

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
                const [a, b] = this.parsePair(id, entities);
                if (a && b) this.onExit(a, b);
            }
        }

        // swap
        this.previous = new Set(this.current);
    }

    getPairId(a, b) {
        return a.id < b.id
            ? `${a.id}:${b.id}`
            : `${b.id}:${a.id}`;
    }

    parsePair(id, entities) {
        const [aId, bId] = id.split(':').map(Number);
        return [
            entities.find(e => e.id === aId),
            entities.find(e => e.id === bId)
        ];
    }

    canCollide(a, b) {
        return this.matrix[a]?.[b]?.collide ?? false;
    }

    // EVENTS

    onEnter(a, b) {
        console.log('ENTER', a.id, b.id);
    }

    onStay(a, b) {
        // opcional
    }

    onExit(a, b) {
        console.log('EXIT', a.id, b.id);
    }
}