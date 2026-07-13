import { System } from '../../engine/ecs/System.js';
import { Health } from '../components/Health.js';
import { DamageQueueComponent } from '../components/DamageQueueComponent.js';
import { SpriteComponent } from '../components/SpriteComponent.js';
import { ZombieAIComponent } from '../components/ZombieAIComponent.js';
import { TurretAIComponent } from '../components/TurretAIComponent.js';

/**
 * Procesa las entidades que tienen un componente DamageQueueComponent.
 * Actúa independientemente del CollisionSystem para centralizar la lógica de daño, 
 * aplicar el feedback visual (parpadeo rojo) y manejar la muerte de la entidad.
 */
export class CombatSystem extends System {
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
        const scene = this.sceneManager.currentScene;
        
        // Obtener todas las entidades que pueden recibir daño y tienen daño pendiente
        const entities = this.world.getEntitiesWith(Health, DamageQueueComponent);

        for (const entityId of entities) {
            const health = this.world.getComponent(entityId, Health);
            const damageQueue = this.world.getComponent(entityId, DamageQueueComponent);
            
            // Si ya está muerta, ignorar daño entrante para evitar recompensas dobles
            if (!health.isAlive) continue;

            // Acumular todo el daño recibido en este fotograma
            let totalDamage = 0;
            for (const amount of damageQueue.damages) {
                totalDamage += amount;
            }

            if (totalDamage > 0) {
                // Aplicar daño
                health.hp -= totalDamage;
                
                // Feedback visual (tinte rojo temporal)
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

                // Chequear si muere
                if (health.hp <= 0) {
                    health.hp = 0;
                    health.isAlive = false;
                    
                    // Notificar a la escena de la muerte
                    if (scene) {
                        const isZombie = this.world.hasComponent(entityId, ZombieAIComponent);
                        if (isZombie && scene.onZombieKilled) {
                            scene.onZombieKilled();
                        }

                        const isTurret = this.world.hasComponent(entityId, TurretAIComponent);
                        if (isTurret && scene.onTurretDestroyed) {
                            scene.onTurretDestroyed(entityId);
                        }
                    }

                    // Limpieza visual: destruir el sprite renderizado
                    if (spriteComp && spriteComp.container) {
                        spriteComp.container.destroy({ children: true });
                        spriteComp.container = null;
                    }
                    
                    // Marcar entidad para ser destruida al final del fotograma
                    this.world.destroyEntity(entityId);
                    continue; // Saltar el resto del bucle para esta entidad
                }
            }

            // Limpiar la cola de daño para que no se itere en el siguiente fotograma
            damageQueue.damages = [];
            this.world.removeComponent(entityId, DamageQueueComponent);
        }
    }
}
