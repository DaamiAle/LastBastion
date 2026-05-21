// src/engine/system/AccelerationSystem.js

import { Velocity } from '../world/components/Velocity.js';
import { Acceleration } from '../world/components/Acceleration.js';
import { Input } from '../world/components/Input.js';

export class AccelerationSystem {
    update(entities, time) {
        const dt = time.deltaTime;

        if (dt === 0) return;

        for (const e of entities) {
            const vel = e.get(Velocity);
            const acc = e.get(Acceleration);

            if (!vel || !acc) continue;

            // Preferir dirección desde el componente Input si está presente (desacopla InputSystem)
            const inputComp = e.get(Input);
            let inputX = 0;
            let inputY = 0;

            if (inputComp) {
                inputX = inputComp.direction.x || 0;
                inputY = inputComp.direction.y || 0;
            } else {
                inputX = acc.inputX || 0;
                inputY = acc.inputY || 0;
            }

            // =========================
            // ACCELERACIÓN
            // =========================
            vel.x += inputX * acc.accel * dt;
            vel.y += inputY * acc.accel * dt;

            // =========================
            // DESACELERACIÓN
            // =========================
            if (inputX === 0) {
                vel.x = approach(vel.x, 0, acc.decel * dt);
            }

            if (inputY === 0) {
                vel.y = approach(vel.y, 0, acc.decel * dt);
            }

            // =========================
            // CLAMP VELOCIDAD
            // =========================
            const speed = Math.hypot(vel.x, vel.y);

            if (speed > acc.maxSpeed) {
                const scale = acc.maxSpeed / speed;
                vel.x *= scale;
                vel.y *= scale;
            }
        }
    }
}

function approach(value, target, delta) {
    if (value < target) return Math.min(value + delta, target);
    if (value > target) return Math.max(value - delta, target);
    return value;
}