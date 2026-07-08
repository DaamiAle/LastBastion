import { System } from '../../engine/ecs/System.js';
import { Transform } from '../components/Transform.js';
import { Velocity } from '../components/Velocity.js';
import { BoidComponent } from '../components/BoidComponent.js';
import { TurretAIComponent } from '../components/TurretAIComponent.js';

/**
 * Updates positions of all entities with a Velocity component.
 * Applies basic flocking behaviors for Boids (zombies) and handles building collisions.
 */
export class MovementSystem extends System {
    /**
     * @param {Object} world The ECS World
     * @param {Object} sceneManager Reference to the SceneManager
     */
    constructor(world, sceneManager) {
        super(world);
        this.sceneManager = sceneManager;
    }

    /**
     * @param {Object} delta Time delta object
     */
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
            
            // Apply collisions with buildings only for zombies (Boids)
            if (this.world.hasComponent(entityId, BoidComponent)) {
                // Fortress Collision
                const scene = this.sceneManager?.currentScene;
                if (scene && scene.fortress && scene.fortress.hp > 0) {
                    // The visual base is 432x432 scaled to 0.6 = ~260, visual radius is ~130.
                    // We add ~16 to account for the physical radius of the zombie.
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
                        // Slots are 40x40 (radius 20). Add zombie radius (16) + padding (8).
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
