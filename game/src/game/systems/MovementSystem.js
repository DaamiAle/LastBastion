import { System } from '../../engine/ecs/System.js';
import { Transform } from '../components/Transform.js';
import { Velocity } from '../components/Velocity.js';
import { BoidComponent } from '../components/BoidComponent.js';

export class MovementSystem extends System {
    constructor(world, sceneManager) {
        super(world);
        this.sceneManager = sceneManager;
    }

    update(delta) {
        const dt = delta.deltaMS;
        
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
            
            // Fortress Collision
            const scene = this.sceneManager?.currentScene;
            if (scene && scene.fortress && scene.fortress.isAlive) {
                const fortress = scene.fortress;
                const dx = transform.x - fortress.container.x;
                const dy = transform.y - fortress.container.y;
                const distance = Math.hypot(dx, dy) || 0.0001;
                // Asumimos un radio generico de 12 para entidades si no tienen uno propio (zombies)
                const minDistance = (fortress.radius ?? 0) + 12;

                if (distance < minDistance) {
                    const push = minDistance - distance;
                    transform.x += (dx / distance) * push;
                    transform.y += (dy / distance) * push;
                }
            }
        }
    }
}
