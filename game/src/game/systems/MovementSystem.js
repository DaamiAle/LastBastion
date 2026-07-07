import { System } from '../../engine/ecs/System.js';
import { Transform } from '../components/Transform.js';
import { Velocity } from '../components/Velocity.js';
import { BoidComponent } from '../components/BoidComponent.js';
import { TurretAIComponent } from '../components/TurretAIComponent.js';

export class MovementSystem extends System {
    constructor(world, sceneManager) {
        super(world);
        this.sceneManager = sceneManager;
    }

    update(delta) {
        const dt = delta.deltaMS / 1000;
        
        // 1. Process Boids
        const boidEntities = this.world.getEntitiesWith(Transform, Velocity, BoidComponent);
        for (const entityId of boidEntities) {
            const transform = this.world.getComponent(entityId, Transform);
            const velocity = this.world.getComponent(entityId, Velocity);
            const boid = this.world.getComponent(entityId, BoidComponent);
            
            // (Flock processing will be expanded here by checking neighbors in SpatialHashGrid)
            
            const seekDx = boid.targetDirectionX * boid.seekWeight;
            const seekDy = boid.targetDirectionY * boid.seekWeight;
            
            // Blend
            velocity.dx = velocity.dx * 0.95 + seekDx * 0.05;
            velocity.dy = velocity.dy * 0.95 + seekDy * 0.05;
            
            const len = Math.hypot(velocity.dx, velocity.dy) || 1;
            velocity.dx /= len;
            velocity.dy /= len;
            
            transform.rotation = Math.atan2(velocity.dy, velocity.dx);
        }

        // 2. Apply final velocities
        const entities = this.world.getEntitiesWith(Transform, Velocity);
        for (const entityId of entities) {
            const transform = this.world.getComponent(entityId, Transform);
            const velocity = this.world.getComponent(entityId, Velocity);
            
            
            transform.x += velocity.dx * velocity.speed * dt;
            transform.y += velocity.dy * velocity.speed * dt;
            
            // Aplicar colisiones con edificios solo a los zombies (Boids)
            if (this.world.hasComponent(entityId, BoidComponent)) {
                // Fortress Collision
                const scene = this.sceneManager?.currentScene;
                if (scene && scene.fortress && scene.fortress.hp > 0) {
                    // La base visual es 432x432 escalada a 0.6 = ~260, su radio visual ronda los 130.
                    // Añadimos ~16 para tener en cuenta el radio físico del zombie.
                    const minDistance = 146;
                    const dx = transform.x - scene.fortress.container.x;
                    const dy = transform.y - scene.fortress.container.y;
                    const distance = Math.hypot(dx, dy) || 0.0001;

                    if (distance < minDistance) {
                        const push = minDistance - distance;
                        transform.x += (dx / distance) * push;
                        transform.y += (dy / distance) * push;
                    }
                }

                // Turret Slots Collision
                if (scene && scene.slots) {
                    for (const slot of scene.slots) {
                        const dx = transform.x - slot.container.x;
                        const dy = transform.y - slot.container.y;
                        const distance = Math.hypot(dx, dy) || 0.0001;
                        // Los slots miden 40x40 (radio 20). Sumamos el radio del zombie (16) + padding (8).
                        const minDistance = 20 + 24;

                        if (distance < minDistance) {
                            const push = minDistance - distance;
                            transform.x += (dx / distance) * push;
                            transform.y += (dy / distance) * push;
                        }
                    }
                }
            }
        }
    }
}
