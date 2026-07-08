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
 * Checks and resolves physical impacts between projectiles and entities (zombies).
 * Uses Continuous Collision Detection (CCD) to prevent high-speed bullets from
 * tunneling through zombies during frame drops.
 */
export class CollisionSystem extends System {
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
                // Destroy if bullet traveled past its max distance without hitting anything
                this.destroyProjectile(projId);
                continue;
            }

            // --- Continuous Collision Detection (CCD) ---
            // Reconstruct the bullet's position from the previous frame.
            // This creates a line segment (Vector) between pLast and current pTransform.
            let pLastX = pTransform.x;
            let pLastY = pTransform.y;
            if (pVelocity) {
                const dt = delta.deltaMS / 1000;
                pLastX = pTransform.x - (pVelocity.dx * pVelocity.speed * dt);
                pLastY = pTransform.y - (pVelocity.dy * pVelocity.speed * dt);
            }

            // Distance squared (line segment length) traveled this frame
            const l2 = distanceSq(pLastX, pLastY, pTransform.x, pTransform.y);

            let hit = false;
            for (const zId of zombies) {
                const zTransform = this.world.getComponent(zId, Transform);
                const zAi = this.world.getComponent(zId, ZombieAIComponent);
                const zHealth = this.world.getComponent(zId, Health);

                if (!zHealth.isAlive) continue;

                // Add real zombie size and bullet size to get exact hitbox radius
                const hitRadius = (zAi.radius ?? 12) + (pData.hitRadius ?? 2);
                
                // Math: Shortest distance from the point (zombie center)
                // to the line segment drawn by the bullet in this frame.
                let colDistSq;
                if (l2 === 0) {
                    // If bullet didn't move (e.g. first frame), measure direct distance
                    colDistSq = distanceSq(zTransform.x, zTransform.y, pTransform.x, pTransform.y);
                } else {
                    // Scalar projection (t) of zombie center onto line segment
                    let t = ((zTransform.x - pLastX) * (pTransform.x - pLastX) + (zTransform.y - pLastY) * (pTransform.y - pLastY)) / l2;
                    // Clamp (0 to 1) ensures projected point stays within segment bounds
                    t = Math.max(0, Math.min(1, t));
                    
                    // Coordinates of nearest point on bullet trajectory
                    const projX = pLastX + t * (pTransform.x - pLastX);
                    const projY = pLastY + t * (pTransform.y - pLastY);
                    
                    // Distance from zombie to intersection point
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
                    // Debug only: near miss
                    console.log(`[DEBUG] MISS NEARBY. Bullet: (${pTransform.x.toFixed(1)}, ${pTransform.y.toFixed(1)}) passed near Zombie: (${zTransform.x.toFixed(1)}, ${zTransform.y.toFixed(1)}). DistSq: ${colDistSq.toFixed(1)}, HitRadSq: ${(hitRadius*hitRadius).toFixed(1)}`);
                }
            }
        }
    }

    /**
     * @param {Object} scene The active scene
     * @param {number} cx Explosion center X
     * @param {number} cy Explosion center Y
     * @param {number} damage Base damage
     * @param {number} splashRadius Radius of effect
     * @param {Array<number>} zombies List of zombie entity IDs
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
     * Enqueues damage on an entity.
     * @param {number} entityId Target entity ID
     * @param {number} amount Damage amount
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
     * Cleans up visual and logical references of a projectile.
     * @param {number} entityId Projectile entity ID
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
