// src/engine/system/MovementSystem.js

import { Transform } from '../world/components/Transform.js';
import { Velocity } from '../world/components/Velocity.js';
import { Input } from '../world/components/Input.js';

export class MovementSystem {
    update(entities, time) {
        const dt = time.deltaTime;

        if (dt === 0) return;

        for (const e of entities) {
            const transform = e.get(Transform);
            const velocity = e.get(Velocity);

            if (!transform || !velocity) continue;

            transform.position.x += velocity.x * dt;
            transform.position.y += velocity.y * dt;

            // Rotar Transform para mirar en la dirección del movimiento
            const speedSq = velocity.x * velocity.x + velocity.y * velocity.y;
            const EPS = 0.0001;

            // Priorizar rotación por velocity.faceMovement
            // Nota: Restar π/2 porque los sprites apuntan hacia abajo (not right)
            if (velocity.faceMovement && speedSq > EPS) {
                transform.rotation = Math.atan2(velocity.y, velocity.x) - Math.PI / 2;
            } else {
                // Si la entidad tiene componente Input que solicita faceMovement, usar su dirección
                const inputComp = e.get(Input);
                if (inputComp && inputComp.faceMovement) {
                    const dx = inputComp.direction.x;
                    const dy = inputComp.direction.y;
                    if (Math.abs(dx) > EPS || Math.abs(dy) > EPS) {
                        transform.rotation = Math.atan2(dy, dx) - Math.PI / 2;
                    }
                }
            }
        }
    }
}