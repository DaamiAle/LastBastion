import { System } from '../../engine/ecs/System.js';
import { Transform } from '../components/Transform.js';
import { ProjectileComponent } from '../components/ProjectileComponent.js';
import { ZombieAIComponent } from '../components/ZombieAIComponent.js';
import { Health } from '../components/Health.js';
import { DamageQueueComponent } from '../components/DamageQueueComponent.js';
import { SpriteComponent } from '../components/SpriteComponent.js';
import { distanceSq } from '../../engine/utils/Utils.js';
import { ExplosionEffectEntity } from '../entities/ExplosionEffectEntity.js';

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

        for (const projId of projectiles) {
            const pTransform = this.world.getComponent(projId, Transform);
            const pData = this.world.getComponent(projId, ProjectileComponent);
            
            const distSq = distanceSq(pData.startX, pData.startY, pTransform.x, pTransform.y);
            if (distSq > pData.maxDistance * pData.maxDistance) {
                this.destroyProjectile(projId);
                continue;
            }

            let hit = false;
            for (const zId of zombies) {
                const zTransform = this.world.getComponent(zId, Transform);
                const zAi = this.world.getComponent(zId, ZombieAIComponent);
                const zHealth = this.world.getComponent(zId, Health);

                if (!zHealth.isAlive) continue;

                const hitRadius = (zAi.radius ?? 12) + 4;
                const colDistSq = distanceSq(pTransform.x, pTransform.y, zTransform.x, zTransform.y);

                if (colDistSq < hitRadius * hitRadius) {
                    hit = true;
                    
                    if (pData.splashRadius > 0) {
                        this.applySplashDamage(scene, pTransform.x, pTransform.y, pData.damage, pData.splashRadius, zombies);
                        scene.addEntity(new ExplosionEffectEntity(scene, pTransform.x, pTransform.y, pData.splashRadius));
                    } else {
                        this.dealDamage(zId, pData.damage);
                    }
                    
                    this.destroyProjectile(projId);
                    break;
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
