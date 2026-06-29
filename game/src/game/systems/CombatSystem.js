import { System } from '../../engine/ecs/System.js';
import { Health } from '../components/Health.js';
import { DamageQueueComponent } from '../components/DamageQueueComponent.js';
import { SpriteComponent } from '../components/SpriteComponent.js';

export class CombatSystem extends System {
    constructor(world, sceneManager) {
        super(world);
        this.sceneManager = sceneManager;
    }

    update(delta) {
        const scene = this.sceneManager.currentScene;
        const entities = this.world.getEntitiesWith(Health, DamageQueueComponent);

        for (const entityId of entities) {
            const health = this.world.getComponent(entityId, Health);
            const damageQueue = this.world.getComponent(entityId, DamageQueueComponent);
            
            if (!health.isAlive) continue;

            let totalDamage = 0;
            for (const amount of damageQueue.damages) {
                totalDamage += amount;
            }

            if (totalDamage > 0) {
                health.hp -= totalDamage;
                
                const spriteComp = this.world.getComponent(entityId, SpriteComponent);
                if (spriteComp && spriteComp.container) {
                    spriteComp.container.alpha = 0.5; // Efecto de parpadeo simple
                }

                if (health.hp <= 0) {
                    health.hp = 0;
                    health.isAlive = false;
                    
                    if (scene && scene.onZombieKilled) {
                        // In a pure ECS, we would use tags/components to know if it's a zombie.
                        // For now we assume if it has BoidComponent or ZombieAIComponent, it's a zombie.
                        // We will do this simply:
                        scene.onZombieKilled();
                    }

                    if (spriteComp && spriteComp.container) {
                        spriteComp.container.destroy({ children: true });
                        spriteComp.container = null;
                    }
                    
                    // We also need to remove it from the SpatialHashGrid.
                    // But in ECS, if an entity dies, we should destroy it entirely.
                    this.world.destroyEntity(entityId);
                    continue; // Skip the rest since entity is destroyed
                }
            }

            damageQueue.damages = [];
            this.world.removeComponent(entityId, DamageQueueComponent);
        }
    }
}
