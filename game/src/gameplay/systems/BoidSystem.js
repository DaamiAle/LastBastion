import { Transform } from '../../engine/world/components/Transform.js';
import { Velocity } from '../../engine/world/components/Velocity.js';
import { Boid } from '../components/Boid.js';

/**
 * BoidSystem
 * 
 * Implementa el algoritmo de Flocking de Craig Reynolds (Separación, Cohesión, Alineación)
 * optimizado con cálculos inline (para evitar crear miles de objetos temporales por frame)
 * y con consultas rápidas mediante el SpatialHashGrid.
 */
export class BoidSystem {
    constructor() {
        this.query = null;
    }

    update(entities, time, scene = null) {
        if (!scene) return;
        const dt = time.deltaTime;

        if (!this.query) {
            this.query = scene.query([Transform, Velocity, Boid]);
        }

        const boids = this.query.entities;
        const grid = scene.grid;

        for (const e of boids) {
            const t = e.get(Transform);
            const v = e.get(Velocity);
            const boid = e.get(Boid);

            if (!t || !v || !boid) continue;

            const tx = t.position.x;
            const ty = t.position.y;

            // ===========================
            // 1. FUERZA DE ATRACCIÓN (SEEK)
            // ===========================
            let seekForceX = 0;
            let seekForceY = 0;

            if (boid.targetEntity && boid.targetEntity.active) {
                const targetTrans = boid.targetEntity.get(Transform);
                if (targetTrans) {
                    const dx = targetTrans.position.x - tx;
                    const dy = targetTrans.position.y - ty;
                    const dist = Math.hypot(dx, dy);

                    if (dist > 5) {
                        // Vector deseado a máxima velocidad
                        const desiredX = (dx / dist) * boid.maxSpeed;
                        const desiredY = (dy / dist) * boid.maxSpeed;

                        // Fuerza de giro = deseada - actual
                        seekForceX = desiredX - v.x;
                        seekForceY = desiredY - v.y;

                        // Limitar fuerza
                        const fLen = Math.hypot(seekForceX, seekForceY);
                        if (fLen > boid.maxForce) {
                            seekForceX = (seekForceX / fLen) * boid.maxForce;
                            seekForceY = (seekForceY / fLen) * boid.maxForce;
                        }
                    }
                }
            }

            // ===========================
            // 2. FUERZAS DE FLOCKING (VECINOS)
            // ===========================
            const neighbors = grid.queryRadius(tx, ty, boid.perceptionRadius);
            
            let alignX = 0, alignY = 0;
            let cohesionX = 0, cohesionY = 0;
            let separationX = 0, separationY = 0;
            let count = 0;

            for (const n of neighbors) {
                if (n === e || !n.active) continue;
                if (count >= 8) break; // Optimization!

                // Solo flocking con otros boids
                const nb = n.get(Boid);
                if (!nb) continue;

                const nt = n.get(Transform);
                const nv = n.get(Velocity);
                if (!nt || !nv) continue;

                const dx = tx - nt.position.x;
                const dy = ty - nt.position.y;
                const distSq = dx * dx + dy * dy;

                if (distSq < boid.perceptionRadius * boid.perceptionRadius && distSq > 0.001) {
                    const dist = Math.sqrt(distSq);

                    // Alineación: promedio de velocidad
                    alignX += nv.x;
                    alignY += nv.y;

                    // Cohesión: promedio de posiciones
                    cohesionX += nt.position.x;
                    cohesionY += nt.position.y;

                    // Separación: repulsión inversamente proporcional a la distancia
                    separationX += dx / distSq;
                    separationY += dy / distSq;

                    count++;
                }
            }

            let alignForceX = 0, alignForceY = 0;
            let cohesionForceX = 0, cohesionForceY = 0;
            let separationForceX = 0, separationForceY = 0;

            if (count > 0) {
                // Alineación
                alignX /= count;
                alignY /= count;
                const aLen = Math.hypot(alignX, alignY);
                if (aLen > 0.001) {
                    const desX = (alignX / aLen) * boid.maxSpeed;
                    const desY = (alignY / aLen) * boid.maxSpeed;
                    alignForceX = desX - v.x;
                    alignForceY = desY - v.y;
                }

                // Cohesión
                cohesionX /= count;
                cohesionY /= count;
                const cohDx = cohesionX - tx;
                const cohDy = cohesionY - ty;
                const cLen = Math.hypot(cohDx, cohDy);
                if (cLen > 0.001) {
                    const desX = (cohDx / cLen) * boid.maxSpeed;
                    const desY = (cohDy / cLen) * boid.maxSpeed;
                    cohesionForceX = desX - v.x;
                    cohesionForceY = desY - v.y;
                }

                // Separación
                const sLen = Math.hypot(separationX, separationY);
                if (sLen > 0.001) {
                    const desX = (separationX / sLen) * boid.maxSpeed;
                    const desY = (separationY / sLen) * boid.maxSpeed;
                    separationForceX = desX - v.x;
                    separationForceY = desY - v.y;
                }

                // Limitar fuerzas de flocking individuales
                const al = Math.hypot(alignForceX, alignForceY);
                if (al > boid.maxForce) {
                    alignForceX = (alignForceX / al) * boid.maxForce;
                    alignForceY = (alignForceY / al) * boid.maxForce;
                }

                const cl = Math.hypot(cohesionForceX, cohesionForceY);
                if (cl > boid.maxForce) {
                    cohesionForceX = (cohesionForceX / cl) * boid.maxForce;
                    cohesionForceY = (cohesionForceY / cl) * boid.maxForce;
                }

                const sl = Math.hypot(separationForceX, separationForceY);
                if (sl > boid.maxForce) {
                    separationForceX = (separationForceX / sl) * boid.maxForce;
                    separationForceY = (separationForceY / sl) * boid.maxForce;
                }
            }

            // ===========================
            // 3. COMBINAR FUERZAS
            // ===========================
            let steerX = seekForceX * boid.seekWeight +
                         alignForceX * boid.alignmentWeight +
                         cohesionForceX * boid.cohesionWeight +
                         separationForceX * boid.separationWeight;

            let steerY = seekForceY * boid.seekWeight +
                         alignForceY * boid.alignmentWeight +
                         cohesionForceY * boid.cohesionWeight +
                         separationForceY * boid.separationWeight;

            // Limitar steering total
            const steerLen = Math.hypot(steerX, steerY);
            if (steerLen > boid.maxForce) {
                steerX = (steerX / steerLen) * boid.maxForce;
                steerY = (steerY / steerLen) * boid.maxForce;
            }

            // Aplicar aceleración directa a la velocidad
            v.x += steerX * dt;
            v.y += steerY * dt;

            // Limitar velocidad máxima del personaje
            const speed = Math.hypot(v.x, v.y);
            if (speed > boid.maxSpeed) {
                v.x = (v.x / speed) * boid.maxSpeed;
                v.y = (v.y / speed) * boid.maxSpeed;
            }
        }
    }
}
