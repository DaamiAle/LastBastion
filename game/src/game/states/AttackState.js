import { State } from '../../engine/core/State.js';
import { distanceSq } from '../../engine/utils/Utils.js';
import { ChaseState } from './ChaseState.js';

import { ZombieAIComponent } from '../components/ZombieAIComponent.js';
import { Transform } from '../components/Transform.js';
import { SoundManager } from '../../engine/utils/SoundManager.js';
import { DamageQueueComponent } from '../components/DamageQueueComponent.js';

/**
 * El estado de ataque para un zombie.
 * Manejado dentro de la FSM del zombie, activa el daño periódicamente sobre el objetivo.
 */
export class AttackState extends State {
    /**
     * @param {number} owner ID de la entidad
     * @param {Object} world El Mundo ECS
     */
    constructor(owner, world) {
        super(owner);
        this.world = world;
    }

    enter() {
        const ai = this.world.getComponent(this.owner, ZombieAIComponent);
        if (ai) {
            ai.attackTimer = 0;
        }
    }

    /**
     * @param {Object} delta Objeto delta de tiempo
     */
    update(delta) {
        const entityId = this.owner;
        const ai = this.world.getComponent(entityId, ZombieAIComponent);
        const transform = this.world.getComponent(entityId, Transform);
        
        if (!ai || !transform || !ai.scene) return;

        const config = ai.scene.game.config.zombies;
        const target = ai.target;

        // Validación: Sin objetivo o el objetivo está muerto
        if (!target || target.isAlive === false) {
            ai.fsm.change(new ChaseState(entityId, this.world));
            return;
        }
        
        let targetX, targetY, targetRadius = 0;
        if (typeof target === 'number') {
            const targetTransform = this.world.getComponent(target, Transform);
            if (targetTransform) {
                targetX = targetTransform.x;
                targetY = targetTransform.y;
                targetRadius = config.turrets?.baseRadius ?? 18;
            } else {
                targetX = transform.x;
                targetY = transform.y;
            }
        } else {
            targetX = target.container ? target.container.x : target.x;
            targetY = target.container ? target.container.y : target.y;
            targetRadius = target.radius ?? 0;
        }

        const distSq = distanceSq(transform.x, transform.y, targetX, targetY);
        const engageRange = ai.attackRange + targetRadius;

        // Tolerancia para salir del rango de ataque
        if (distSq > engageRange * engageRange * config.attackExitRangeMultiplier) {
            ai.fsm.change(new ChaseState(entityId, this.world));
            return;
        }

        ai.attackTimer -= delta.deltaMS;
        if (ai.attackTimer <= 0) {
            ai.attackTimer = ai.attackCooldown;

            // Aplicar daño según el tipo de objetivo
            if (ai.target.type === 'fortress') {
                ai.target.hp -= ai.damage;
                SoundManager.play('zombie_attack');
            } else if (target.takeDamage) {
                target.takeDamage(ai.damage);
                SoundManager.play('zombie_attack');
            } else {
                let damageQueue = this.world.getComponent(target, DamageQueueComponent);
                if (!damageQueue) {
                    damageQueue = new DamageQueueComponent();
                    this.world.addComponent(target, damageQueue);
                }
                damageQueue.addDamage(ai.damage);
                SoundManager.play('zombie_attack');
            }
        }
    }
}
