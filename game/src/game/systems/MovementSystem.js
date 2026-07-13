import { System } from '../../engine/ecs/System.js';
import { Transform } from '../components/Transform.js';
import { Velocity } from '../components/Velocity.js';
import { BoidComponent } from '../components/BoidComponent.js';
import { TurretAIComponent } from '../components/TurretAIComponent.js';

/**
 * Actualiza las posiciones de todas las entidades con un componente Velocity.
 * Aplica comportamientos básicos de bandada para Boids (zombies) y maneja las colisiones con edificios.
 */
export class MovementSystem extends System {
    /**
     * @param {Object} world El Mundo ECS
     * @param {Object} sceneManager Referencia al SceneManager
     */
    constructor(world, sceneManager) {
        super(world);
        this.sceneManager = sceneManager;
    }

    /**
     * @param {Object} delta Objeto delta de tiempo
     */
    update(delta) {
        const dt = delta.deltaMS / 1000;
        
        // 1. Procesar Boids
        const boidEntities = this.world.getEntitiesWith(Transform, Velocity, BoidComponent);
        for (const entityId of boidEntities) {
            const transform = this.world.getComponent(entityId, Transform);
            const velocity = this.world.getComponent(entityId, Velocity);
            const boid = this.world.getComponent(entityId, BoidComponent);
            
            // (El procesamiento de la bandada se expandirá aquí comprobando vecinos en el SpatialHashGrid)
            
            const seekDx = boid.targetDirectionX * boid.seekWeight;
            const seekDy = boid.targetDirectionY * boid.seekWeight;
            
            // Mezclar
            velocity.dx = velocity.dx * 0.95 + seekDx * 0.05;
            velocity.dy = velocity.dy * 0.95 + seekDy * 0.05;
            
            const len = Math.hypot(velocity.dx, velocity.dy) || 1;
            velocity.dx /= len;
            velocity.dy /= len;
            
            transform.rotation = Math.atan2(velocity.dy, velocity.dx);
        }

        // 2. Aplicar velocidades finales
        const entities = this.world.getEntitiesWith(Transform, Velocity);
        for (const entityId of entities) {
            const transform = this.world.getComponent(entityId, Transform);
            const velocity = this.world.getComponent(entityId, Velocity);
            
            
            transform.x += velocity.dx * velocity.speed * dt;
            transform.y += velocity.dy * velocity.speed * dt;
            
            // Aplicar colisiones con edificios solo para zombies (Boids)
            if (this.world.hasComponent(entityId, BoidComponent)) {
                // Colisión con la Fortaleza
                const scene = this.sceneManager?.currentScene;
                if (scene && scene.fortress && scene.fortress.hp > 0) {
                    // La base visual es de 432x432 escalada a 0.6 = ~260, el radio visual es ~130.
                    // Sumamos ~16 para tener en cuenta el radio físico del zombie.
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

                // Colisión con los Espacios (Slots) de Torreta
                if (scene && scene.slots) {
                    for (const slot of scene.slots) {
                        const dx = transform.x - slot.container.x;
                        const dy = transform.y - slot.container.y;
                        const distance = Math.hypot(dx, dy) || 0.0001;
                        // Los slots son de 40x40 (radio 20). Sumar radio del zombie (16) + relleno (8).
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
