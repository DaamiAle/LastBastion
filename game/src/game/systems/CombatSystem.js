import { System } from '../../engine/ecs/System.js';
import { Health } from '../components/Health.js';
import { DamageQueueComponent } from '../components/DamageQueueComponent.js';
import { SpriteComponent } from '../components/SpriteComponent.js';

/**
 * Processes entities with a DamageQueueComponent.
 * Acts separately from CollisionSystem to centralize damage logic, 
 * apply visual feedback (flashing), and handle entity death.
 */
export class CombatSystem extends System {
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
        const scene = this.sceneManager.currentScene;
        
        // Get all entities that can receive damage and have a pending damage queue
        const entities = this.world.getEntitiesWith(Health, DamageQueueComponent);

        for (const entityId of entities) {
            const health = this.world.getComponent(entityId, Health);
            const damageQueue = this.world.getComponent(entityId, DamageQueueComponent);
            
            // If already dead, ignore incoming damage to avoid double rewards
            if (!health.isAlive) continue;

            // Accumulate all damage received this frame (e.g. multiple bullets hitting at once)
            let totalDamage = 0;
            for (const amount of damageQueue.damages) {
                totalDamage += amount;
            }

            if (totalDamage > 0) {
                // Apply damage
                health.hp -= totalDamage;
                
                // Visual feedback (temporal red tint)
                const spriteComp = this.world.getComponent(entityId, SpriteComponent);
                if (spriteComp && spriteComp.container && spriteComp.container.children.length > 0) {
                    const sprite = spriteComp.container.children[0];
                    if (sprite) {
                        sprite.tint = 0xff0000;
                        setTimeout(() => {
                            if (!sprite.destroyed) {
                                sprite.tint = 0xffffff;
                            }
                        }, 100);
                    }
                }

                // Check for death
                if (health.hp <= 0) {
                    health.hp = 0;
                    health.isAlive = false;
                    
                    // Notify scene of zombie death to reward player
                    if (scene && scene.onZombieKilled) {
                        // In pure ECS we'd verify a ZombieTag component.
                        // Here we assume if it yields a reward, it's an enemy.
                        scene.onZombieKilled();
                    }

                    // Visual cleanup: destroy rendered sprite
                    if (spriteComp && spriteComp.container) {
                        spriteComp.container.destroy({ children: true });
                        spriteComp.container = null;
                    }
                    
                    // Mark entity for destruction at end of frame
                    this.world.destroyEntity(entityId);
                    continue; // Skip the rest of the loop for this entity
                }
            }

            // Clean damage queue component so it isn't iterated next frame unless it takes damage again.
            damageQueue.damages = [];
            this.world.removeComponent(entityId, DamageQueueComponent);
        }
    }
}
