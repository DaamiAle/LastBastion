import { System } from '../../engine/ecs/System.js';
import { Transform } from '../components/Transform.js';
import { ProjectileComponent } from '../components/ProjectileComponent.js';
import { ZombieAIComponent } from '../components/ZombieAIComponent.js';
import { Health } from '../components/Health.js';
import { DamageQueueComponent } from '../components/DamageQueueComponent.js';
import { SpriteComponent } from '../components/SpriteComponent.js';
import { Velocity } from '../components/Velocity.js';
import { distanceSq } from '../../engine/utils/Utils.js';
import { ExplosionEffectEntity } from '../entities/ExplosionEffectEntity.js';

/**
 * Comprueba y resuelve los impactos físicos entre proyectiles y entidades (zombies).
 * Utiliza Detección Continua de Colisiones (CCD) para evitar que balas a gran velocidad
 * atraviesen a los zombies en caso de caída de fotogramas (frame drops).
 */
export class CollisionSystem extends System {
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
        if (!scene) return;

        const projectiles = this.world.getEntitiesWith(Transform, ProjectileComponent);
        const zombies = this.world.getEntitiesWith(Transform, ZombieAIComponent, Health);

        this.frameCount = (this.frameCount || 0) + 1;
        if (this.frameCount % 60 === 0) {
            console.log(`[DEBUG] CollisionSystem TICK. Balas: ${projectiles.length}, Zombies: ${zombies.length}`);
        }

        for (const projId of projectiles) {
            const pTransform = this.world.getComponent(projId, Transform);
            const pData = this.world.getComponent(projId, ProjectileComponent);
            const pVelocity = this.world.getComponent(projId, Velocity);
            
            const distSq = distanceSq(pData.startX, pData.startY, pTransform.x, pTransform.y);
            if (distSq > pData.maxDistance * pData.maxDistance) {
                // Destruir si la bala viajó más allá de su distancia máxima sin golpear nada
                this.destroyProjectile(projId);
                continue;
            }

            // --- Detección Continua de Colisiones (CCD) ---
            // Reconstruye la posición de la bala desde el fotograma anterior.
            // Esto crea un segmento de línea (Vector) entre pLast y el pTransform actual.
            let pLastX = pTransform.x;
            let pLastY = pTransform.y;
            if (pVelocity) {
                const dt = delta.deltaMS / 1000;
                pLastX = pTransform.x - (pVelocity.dx * pVelocity.speed * dt);
                pLastY = pTransform.y - (pVelocity.dy * pVelocity.speed * dt);
            }

            // Distancia al cuadrado (longitud del segmento de línea) viajada en este fotograma
            const l2 = distanceSq(pLastX, pLastY, pTransform.x, pTransform.y);

            let hit = false;
            for (const zId of zombies) {
                const zTransform = this.world.getComponent(zId, Transform);
                const zAi = this.world.getComponent(zId, ZombieAIComponent);
                const zHealth = this.world.getComponent(zId, Health);

                if (!zHealth.isAlive) continue;

                // Sumar el tamaño real del zombie y el tamaño de la bala para obtener el radio de impacto exacto
                const hitRadius = (zAi.radius ?? 12) + (pData.hitRadius ?? 2);
                
                // Matemáticas: La distancia más corta desde el punto (centro del zombie)
                // al segmento de línea trazado por la bala en este fotograma.
                let colDistSq;
                if (l2 === 0) {
                    // Si la bala no se movió (ej. primer fotograma), medir la distancia directa
                    colDistSq = distanceSq(zTransform.x, zTransform.y, pTransform.x, pTransform.y);
                } else {
                    // Proyección escalar (t) del centro del zombie sobre el segmento de línea
                    let t = ((zTransform.x - pLastX) * (pTransform.x - pLastX) + (zTransform.y - pLastY) * (pTransform.y - pLastY)) / l2;
                    // Limitar (0 a 1) asegura que el punto proyectado se mantenga dentro de los límites del segmento
                    t = Math.max(0, Math.min(1, t));
                    
                    // Coordenadas del punto más cercano en la trayectoria de la bala
                    const projX = pLastX + t * (pTransform.x - pLastX);
                    const projY = pLastY + t * (pTransform.y - pLastY);
                    
                    // Distancia desde el zombie al punto de intersección
                    colDistSq = distanceSq(zTransform.x, zTransform.y, projX, projY);
                }

                if (colDistSq < hitRadius * hitRadius) {
                    console.log(`[DEBUG] HIT! Bala: (${pTransform.x.toFixed(1)}, ${pTransform.y.toFixed(1)}) golpeó a Zombie: (${zTransform.x.toFixed(1)}, ${zTransform.y.toFixed(1)}). DistSq: ${colDistSq.toFixed(1)}, HitRadSq: ${(hitRadius*hitRadius).toFixed(1)}`);
                    hit = true;
                    
                    if (pData.splashRadius > 0) {
                        this.applySplashDamage(scene, pTransform.x, pTransform.y, pData.damage, pData.splashRadius, zombies);
                        scene.addEntity(new ExplosionEffectEntity(scene, pTransform.x, pTransform.y, pData.splashRadius));
                    } else {
                        this.dealDamage(zId, pData.damage);
                    }
                    
                    this.destroyProjectile(projId);
                    break;
                } else if (colDistSq < 10000) {
                    // Solo para debug: fallo por poco
                    console.log(`[DEBUG] CASI. Bala: (${pTransform.x.toFixed(1)}, ${pTransform.y.toFixed(1)}) pasó cerca de Zombie: (${zTransform.x.toFixed(1)}, ${zTransform.y.toFixed(1)}). DistSq: ${colDistSq.toFixed(1)}, HitRadSq: ${(hitRadius*hitRadius).toFixed(1)}`);
                }
            }
        }
    }

    /**
     * @param {Object} scene La escena activa
     * @param {number} cx Centro de la explosión X
     * @param {number} cy Centro de la explosión Y
     * @param {number} damage Daño base
     * @param {number} splashRadius Radio de efecto
     * @param {Array<number>} zombies Lista de IDs de entidades zombie
     */
    applySplashDamage(scene, cx, cy, damage, splashRadius, zombies) {
        const splashSq = splashRadius * splashRadius;
        for (const zId of zombies) {
            const zTransform = this.world.getComponent(zId, Transform);
            const zHealth = this.world.getComponent(zId, Health);
            if (!zHealth.isAlive) continue;

            const distSq = distanceSq(cx, cy, zTransform.x, zTransform.y);
            if (distSq <= splashSq) {
                this.dealDamage(zId, damage);
            }
        }
    }

    /**
     * Encola el daño en una entidad.
     * @param {number} entityId ID de la entidad objetivo
     * @param {number} amount Cantidad de daño
     */
    dealDamage(entityId, amount) {
        console.log("DEAL DAMAGE", entityId, amount);
        let queue = this.world.getComponent(entityId, DamageQueueComponent);
        if (!queue) {
            queue = new DamageQueueComponent();
            this.world.addComponent(entityId, queue);
        }
        queue.addDamage(amount);
    }

    /**
     * Limpia las referencias lógicas y visuales de un proyectil.
     * @param {number} entityId ID de la entidad proyectil
     */
    destroyProjectile(entityId) {
        const spriteComp = this.world.getComponent(entityId, SpriteComponent);
        if (spriteComp && spriteComp.container) {
            spriteComp.container.destroy({ children: true });
            spriteComp.container = null;
        }
        this.world.destroyEntity(entityId);
    }
}
