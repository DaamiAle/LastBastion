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
 * CollisionSystem verifica y resuelve los impactos físicos entre proyectiles y entidades (zombies).
 * Utiliza detección de colisión continua (CCD) para evitar que las balas, por su alta velocidad,
 * "atraviesen" (tunneling) a los zombies cuando los FPS caen.
 */
export class CollisionSystem extends System {
    constructor(world, sceneManager) {
        super(world);
        this.sceneManager = sceneManager;
    }

    update(delta) {
        const scene = this.sceneManager.currentScene;
        if (!scene) return;

        const projectiles = this.world.getEntitiesWith(Transform, ProjectileComponent);
        const zombies = this.world.getEntitiesWith(Transform, ZombieAIComponent, Health);

        this.frameCount = (this.frameCount || 0) + 1;
        if (this.frameCount % 60 === 0) {
            console.log(`[DEBUG] CollisionSystem TICK. Bullets: ${projectiles.length}, Zombies: ${zombies.length}`);
        }

        for (const projId of projectiles) {
            const pTransform = this.world.getComponent(projId, Transform);
            const pData = this.world.getComponent(projId, ProjectileComponent);
            const pVelocity = this.world.getComponent(projId, Velocity);
            
            const distSq = distanceSq(pData.startX, pData.startY, pTransform.x, pTransform.y);
            if (distSq > pData.maxDistance * pData.maxDistance) {
                // Si la bala supera su distancia máxima de viaje, se destruye sin golpear nada.
                this.destroyProjectile(projId);
                continue;
            }

            // --- Continuous Collision Detection (CCD) ---
            // Reconstruimos la posición que tenía la bala en el frame anterior.
            // Esto crea un segmento de línea (Vector) entre pLast y pTransform actual.
            let pLastX = pTransform.x;
            let pLastY = pTransform.y;
            if (pVelocity) {
                const dt = delta.deltaMS / 1000;
                pLastX = pTransform.x - (pVelocity.dx * pVelocity.speed * dt);
                pLastY = pTransform.y - (pVelocity.dy * pVelocity.speed * dt);
            }

            // Distancia al cuadrado (longitud de la línea) recorrida en este frame
            const l2 = distanceSq(pLastX, pLastY, pTransform.x, pTransform.y);

            let hit = false;
            for (const zId of zombies) {
                const zTransform = this.world.getComponent(zId, Transform);
                const zAi = this.world.getComponent(zId, ZombieAIComponent);
                const zHealth = this.world.getComponent(zId, Health);

                if (!zHealth.isAlive) continue;

                // Sumamos el tamaño real del zombie y el tamaño real de la bala para calcular el hitbox exacto
                const hitRadius = (zAi.radius ?? 12) + (pData.hitRadius ?? 2);
                
                // Cálculo matemático: Distancia más corta desde el punto (centro del zombie)
                // al segmento de línea trazado por la bala en este frame.
                let colDistSq;
                if (l2 === 0) {
                    // Si la bala no se movió (ej. primer frame), medimos la distancia directa
                    colDistSq = distanceSq(zTransform.x, zTransform.y, pTransform.x, pTransform.y);
                } else {
                    // Proyección escalar (t) del centro del zombie sobre el segmento de línea
                    let t = ((zTransform.x - pLastX) * (pTransform.x - pLastX) + (zTransform.y - pLastY) * (pTransform.y - pLastY)) / l2;
                    // Clamp (0 a 1) asegura que el punto proyectado no se salga de los extremos del segmento
                    t = Math.max(0, Math.min(1, t));
                    
                    // Coordenadas del punto más cercano sobre la trayectoria de la bala
                    const projX = pLastX + t * (pTransform.x - pLastX);
                    const projY = pLastY + t * (pTransform.y - pLastY);
                    
                    // Distancia desde el zombie a ese punto de intersección
                    colDistSq = distanceSq(zTransform.x, zTransform.y, projX, projY);
                }

                if (colDistSq < hitRadius * hitRadius) {
                    console.log(`[DEBUG] HIT! Bullet: (${pTransform.x.toFixed(1)}, ${pTransform.y.toFixed(1)}) hit Zombie: (${zTransform.x.toFixed(1)}, ${zTransform.y.toFixed(1)}). DistSq: ${colDistSq.toFixed(1)}, HitRadSq: ${(hitRadius*hitRadius).toFixed(1)}`);
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
                    // Solo para debug si pasa cerca pero no le da
                    console.log(`[DEBUG] MISS NEARBY. Bullet: (${pTransform.x.toFixed(1)}, ${pTransform.y.toFixed(1)}) passed near Zombie: (${zTransform.x.toFixed(1)}, ${zTransform.y.toFixed(1)}). DistSq: ${colDistSq.toFixed(1)}, HitRadSq: ${(hitRadius*hitRadius).toFixed(1)}`);
                }
            }
        }
    }

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

    dealDamage(entityId, amount) {
        console.log("DEAL DAMAGE", entityId, amount);
        let queue = this.world.getComponent(entityId, DamageQueueComponent);
        if (!queue) {
            queue = new DamageQueueComponent();
            this.world.addComponent(entityId, queue);
        }
        queue.addDamage(amount);
    }

    destroyProjectile(entityId) {
        const spriteComp = this.world.getComponent(entityId, SpriteComponent);
        if (spriteComp && spriteComp.container) {
            spriteComp.container.destroy({ children: true });
            spriteComp.container = null;
        }
        this.world.destroyEntity(entityId);
    }
}
