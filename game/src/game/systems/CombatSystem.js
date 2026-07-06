import { System } from '../../engine/ecs/System.js';
import { Health } from '../components/Health.js';
import { DamageQueueComponent } from '../components/DamageQueueComponent.js';
import { SpriteComponent } from '../components/SpriteComponent.js';

/**
 * El CombatSystem se encarga de procesar los componentes de DamageQueueComponent.
 * Actúa separadamente del CollisionSystem para concentrar la lógica de daño, 
 * aplicación de estado visual (como parpadeos) y muerte de las entidades de forma centralizada.
 */
export class CombatSystem extends System {
    constructor(world, sceneManager) {
        super(world);
        this.sceneManager = sceneManager;
    }

    update(delta) {
        const scene = this.sceneManager.currentScene;
        
        // Obtiene todas las entidades que pueden recibir daño y que tienen una cola de daño pendiente
        const entities = this.world.getEntitiesWith(Health, DamageQueueComponent);

        for (const entityId of entities) {
            const health = this.world.getComponent(entityId, Health);
            const damageQueue = this.world.getComponent(entityId, DamageQueueComponent);
            
            // Si la entidad ya está muerta, ignoramos el daño entrante para evitar sobrecargas o recompensas dobles
            if (!health.isAlive) continue;

            // Acumular todo el daño recibido en este frame (pueden ser múltiples balas impactando a la vez)
            let totalDamage = 0;
            for (const amount of damageQueue.damages) {
                totalDamage += amount;
            }

            if (totalDamage > 0) {
                // Aplicar el daño a la vida de la entidad
                health.hp -= totalDamage;
                
                // Efecto visual básico de feedback de daño (parpadeo o transparencia temporal)
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

                // Evaluar la muerte de la entidad
                if (health.hp <= 0) {
                    health.hp = 0;
                    health.isAlive = false;
                    
                    // Notificamos a la escena que murió un zombie para entregar recursos/monedas al jugador
                    if (scene && scene.onZombieKilled) {
                        // Idealmente en ECS puro verificaríamos si la entidad tiene un componente específico (ej. ZombieTag)
                        // Para este prototipo asumimos que si pasa por aquí y genera recompensa, es un enemigo.
                        scene.onZombieKilled();
                    }

                    // Limpieza visual: eliminamos el sprite renderizado
                    if (spriteComp && spriteComp.container) {
                        spriteComp.container.destroy({ children: true });
                        spriteComp.container = null;
                    }
                    
                    // Marcamos la entidad para ser destruida del ECS al final del frame
                    this.world.destroyEntity(entityId);
                    continue; // Al morir, evitamos ejecutar el resto del código y pasamos a la siguiente entidad
                }
            }

            // Una vez procesada la cola de daños de este frame, la limpiamos y retiramos el componente
            // de esta manera la entidad deja de ser iterada por este sistema en el próximo frame si no recibe más daño.
            damageQueue.damages = [];
            this.world.removeComponent(entityId, DamageQueueComponent);
        }
    }
}
