import { Transform } from '../world/components/Transform.js';
import { CircleCollider } from '../world/components/colliders/CircleCollider.js';
import { BoxCollider } from '../world/components/colliders/BoxCollider.js';
import { Velocity } from '../world/components/Velocity.js';

/**
 * CollisionResolutionSystem
 * 
 * Resuelve físicamente las colisiones (push-out) para evitar superposiciones.
 * Determina el desplazamiento mínimo necesario y lo aplica a la posición de las entidades.
 */
export class CollisionResolutionSystem {
    /**
     * @param {Object} matrix - Matriz de colisiones con propiedades { collide, resolve }
     * @param {SpatialHashGrid} grid - Grid espacial de la escena
     */
    constructor(matrix, grid) {
        this.matrix = matrix;
        this.grid = grid;
    }

    update(entities) {
        // Para evitar resolver la misma colisión dos veces, usamos un conjunto de pares resueltos
        const resolvedPairs = new Set();

        for (const a of entities) {
            if (!a.active) continue;

            const ta = a.get(Transform);
            if (!ta) continue;

            const ca = a.get(CircleCollider) || a.get(BoxCollider);
            if (!ca || ca.noCollide) continue;

            // Radio aproximado para consulta espacial
            let radius = ca.type === 'circle' ? ca.radius : Math.max(ca.width, ca.height) / 2;

            const neighbors = this.grid.queryRadius(ta.position.x, ta.position.y, radius);

            for (const b of neighbors) {
                if (a === b || !b.active) continue;

                // Ordenar por ID para consistencia y evitar doble resolución
                const pairId = a.id < b.id ? `${a.id}:${b.id}` : `${b.id}:${a.id}`;
                if (resolvedPairs.has(pairId)) continue;

                const tb = b.get(Transform);
                if (!tb) continue;

                const cb = b.get(CircleCollider) || b.get(BoxCollider);
                if (!cb || cb.noCollide) continue;

                // Verificar si deben resolver físicamente la colisión
                if (!this._shouldResolve(ca.layer, cb.layer)) continue;

                // Calcular solapamiento
                const resolution = this._getResolution(ta, ca, tb, cb);
                if (resolution) {
                    resolvedPairs.add(pairId);
                    this._applyResolution(a, ta, b, tb, resolution);
                }
            }
        }
    }

    /**
     * Comprobar en la matriz de colisión si se debe resolver físicamente el choque
     */
    _shouldResolve(layerA, layerB) {
        return this.matrix[layerA]?.[layerB]?.resolve || this.matrix[layerB]?.[layerA]?.resolve || false;
    }

    /**
     * Calcula el vector de penetración mínimo para empujar las entidades
     * Devuelve { nx, ny, overlap } donde n apunta de A hacia B
     */
    _getResolution(ta, ca, tb, cb) {
        // Círculo vs Círculo
        if (ca.type === 'circle' && cb.type === 'circle') {
            const dx = tb.position.x - ta.position.x;
            const dy = tb.position.y - ta.position.y;
            const distSq = dx * dx + dy * dy;
            const minDist = ca.radius + cb.radius;

            if (distSq < minDist * minDist) {
                const dist = Math.sqrt(distSq);
                const overlap = minDist - dist;
                const nx = dist > 0.0001 ? dx / dist : 1;
                const ny = dist > 0.0001 ? dy / dist : 0;
                return { nx, ny, overlap };
            }
        }
        
        // Caja vs Caja
        if (ca.type === 'box' && cb.type === 'box') {
            const wa = ca.width / 2;
            const ha = ca.height / 2;
            const wb = cb.width / 2;
            const hb = cb.height / 2;

            const dx = tb.position.x - ta.position.x;
            const dy = tb.position.y - ta.position.y;

            const overlapX = (wa + wb) - Math.abs(dx);
            const overlapY = (ha + hb) - Math.abs(dy);

            if (overlapX > 0 && overlapY > 0) {
                // Resolver en el eje de menor penetración
                if (overlapX < overlapY) {
                    const nx = dx > 0 ? 1 : -1;
                    return { nx, ny: 0, overlap: overlapX };
                } else {
                    const ny = dy > 0 ? 1 : -1;
                    return { nx: 0, ny, overlap: overlapY };
                }
            }
        }

        // Círculo vs Caja
        if (ca.type === 'circle' && cb.type === 'box') {
            return this._getCircleBoxResolution(ta, ca, tb, cb);
        }
        if (ca.type === 'box' && cb.type === 'circle') {
            const res = this._getCircleBoxResolution(tb, cb, ta, ca);
            if (res) {
                // Invertir dirección para mantener que n apunta de A hacia B
                res.nx *= -1;
                res.ny *= -1;
            }
            return res;
        }

        return null;
    }

    /**
     * Calcula resolución círculo (A) vs caja (B)
     */
    _getCircleBoxResolution(circleTrans, circleCol, boxTrans, boxCol) {
        const cx = circleTrans.position.x;
        const cy = circleTrans.position.y;
        const r = circleCol.radius;

        const bx = boxTrans.position.x;
        const by = boxTrans.position.y;
        const bw = boxCol.width / 2;
        const bh = boxCol.height / 2;

        // Punto más cercano de la caja al círculo
        const px = Math.max(bx - bw, Math.min(cx, bx + bw));
        const py = Math.max(by - bh, Math.min(cy, by + bh));

        const dx = cx - px;
        const dy = cy - py;
        const distSq = dx * dx + dy * dy;

        if (distSq < r * r) {
            const dist = Math.sqrt(distSq);

            if (dist > 0.0001) {
                // Círculo fuera de la caja, colisión en bordes
                const overlap = r - dist;
                const nx = dx / dist; // apunta de B (caja) a A (círculo)
                const ny = dy / dist;
                // Invertimos porque la función devuelve n de A (círculo) a B (caja)
                return { nx: -nx, ny: -ny, overlap };
            } else {
                // Centro del círculo está dentro de la caja: empujar al borde más cercano
                const dl = cx - (bx - bw);
                const dr = (bx + bw) - cx;
                const dt = cy - (by - bh);
                const db = (by + bh) - cy;

                const minDist = Math.min(dl, dr, dt, db);
                
                if (minDist === dl) return { nx: 1, ny: 0, overlap: r + dl }; // Empuja A a la izquierda (B a la derecha)
                if (minDist === dr) return { nx: -1, ny: 0, overlap: r + dr };
                if (minDist === dt) return { nx: 0, ny: 1, overlap: r + dt };
                return { nx: 0, ny: -1, overlap: r + db };
            }
        }

        return null;
    }

    /**
     * Aplica el desplazamiento físico a los componentes Transform
     */
    _applyResolution(entityA, ta, entityB, tb, { nx, ny, overlap }) {
        const dynamicA = entityA.has(Velocity);
        const dynamicB = entityB.has(Velocity);

        if (dynamicA && dynamicB) {
            // Ambas dinámicas: desplazar 50% cada una en sentidos opuestos
            ta.position.x -= nx * overlap * 0.5;
            ta.position.y -= ny * overlap * 0.5;

            tb.position.x += nx * overlap * 0.5;
            tb.position.y += ny * overlap * 0.5;
        } else if (dynamicA) {
            // Solo A es dinámica: desplazar 100% A
            ta.position.x -= nx * overlap;
            ta.position.y -= ny * overlap;
        } else if (dynamicB) {
            // Solo B es dinámica: desplazar 100% B
            tb.position.x += nx * overlap;
            tb.position.y += ny * overlap;
        }
    }
}
