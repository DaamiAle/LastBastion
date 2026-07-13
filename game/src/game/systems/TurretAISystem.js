import { System } from '../../engine/ecs/System.js';
import { TurretAIComponent } from '../components/TurretAIComponent.js';
import { Transform } from '../components/Transform.js';
import { AimComponent } from '../components/AimComponent.js';
import { assembleBullet } from '../assemblers/BulletAssembler.js';
import { SoundManager } from '../../engine/utils/SoundManager.js';

/**
 * Maneja la adquisición de objetivos, el apuntado y el disparo de las entidades torreta.
 */
export class TurretAISystem extends System {
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

        const entities = this.world.getEntitiesWith(TurretAIComponent, Transform, AimComponent);
        for (const entityId of entities) {
            const ai = this.world.getComponent(entityId, TurretAIComponent);
            const transform = this.world.getComponent(entityId, Transform);
            const aim = this.world.getComponent(entityId, AimComponent);
            
            ai.fireTimer -= delta.deltaMS;

            // Validación del objetivo (comprobar si está muerto o fuera de rango)
            if (ai.target !== null) {
                if (typeof ai.target === 'number') {
                    if (!this.world.hasEntity(ai.target)) {
                        ai.target = null;
                    }
                } else if (!ai.target.isAlive) {
                    ai.target = null;
                }
            }
            if (ai.target) {
                let targetX, targetY;
                if (typeof ai.target === 'number') {
                    const tTransform = this.world.getComponent(ai.target, Transform);
                    if (tTransform) {
                        targetX = tTransform.x;
                        targetY = tTransform.y;
                    } else {
                        ai.target = null;
                        continue;
                    }
                } else {
                    targetX = ai.target.container ? ai.target.container.x : ai.target.x;
                    targetY = ai.target.container ? ai.target.container.y : ai.target.y;
                }
                const dx = targetX - transform.x;
                const dy = targetY - transform.y;
                if (dx * dx + dy * dy > ai.range * ai.range) {
                    ai.target = null;
                }
            }
            
            // Buscar nuevo objetivo
            if (!ai.target) {
                ai.target = scene.findNearestEnemy(transform.x, transform.y, ai.range);
            }

            if (!ai.target) continue;

            let targetX, targetY;
            if (typeof ai.target === 'number') {
                const tTransform = this.world.getComponent(ai.target, Transform);
                if (tTransform) {
                    targetX = tTransform.x;
                    targetY = tTransform.y;
                } else {
                    continue;
                }
            } else {
                targetX = ai.target.container ? ai.target.container.x : ai.target.x;
                targetY = ai.target.container ? ai.target.container.y : ai.target.y;
            }
            
            const dx = targetX - transform.x;
            const dy = targetY - transform.y;
            const angle = Math.atan2(dy, dx);
            const len = Math.hypot(dx, dy) || 1;

            // Apuntar cañón
            if (aim.barrelSprite) {
                aim.barrelSprite.rotation = angle + Math.PI * 0.5;
            }
            
            // Disparar
            if (ai.fireTimer <= 0) {
                ai.fireTimer = ai.fireRate;
                
                scene.emitNoise(transform.x, transform.y, {
                    radius: ai.noiseRadius,
                    ttl: ai.noiseTtlMs,
                    strength: ai.noiseStrength
                });
                
                const soundAlias = ai.turretType === 'machinegun' ? 'machinegun_shot' : `${ai.turretType}_shoot`;
                SoundManager.play(soundAlias);

                assembleBullet(
                    scene,
                    transform.x + Math.cos(angle) * 22,
                    transform.y + Math.sin(angle) * 22,
                    dx / len,
                    dy / len,
                    {
                        damage: ai.damage,
                        color: ai.color,
                        speed: ai.projectileSpeed,
                        size: ai.splashRadius > 0 ? 6 : 4,
                        maxDistance: ai.range + 24,
                        splashRadius: ai.splashRadius,
                        texture: scene.game.assets[ai.turretType + 'BulletTexture'],
                        rotationOffset: Math.PI / 2
                    }
                );
            }
        }
    }
}
