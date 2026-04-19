import { Transform } from '../world/components/Transform.js';
import { Velocity } from '../world/components/Velocity.js';

export class MovementSystem {
    update(entities, delta) {
        for (const e of entities) {
            const transform = e.get(Transform);
            const velocity = e.get(Velocity);

            if (!transform || !velocity) continue;

            transform.position.x += velocity.x * delta;
            transform.position.y += velocity.y * delta;
        }
    }
}