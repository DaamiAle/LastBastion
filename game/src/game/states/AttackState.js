import { State } from '../../engine/core/State.js';
import { distanceSq } from '../../engine/utils/Utils.js';
import { ChaseState } from './ChaseState.js';

import { ZombieAIComponent } from '../components/ZombieAIComponent.js';
import { Transform } from '../components/Transform.js';
import { SoundManager } from '../../engine/utils/SoundManager.js';
import { DamageQueueComponent } from '../components/DamageQueueComponent.js';

/**
 * The attacking state for a zombie.
 * Handled within the FSM of the zombie, triggers damage periodically on the target.
 */
export class AttackState extends State {
    /**
     * @param {number} owner Entity ID
     * @param {Object} world The ECS World
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
     * @param {Object} delta Time delta object
     */
    update(delta) {
        const entityId = this.owner;
        const ai = this.world.getComponent(entityId, ZombieAIComponent);
        const transform = this.world.getComponent(entityId, Transform);
        
        if (!ai || !transform || !ai.scene) return;

        const config = ai.scene.game.config.zombies;
        const target = ai.target;

        // Validation: No target or target is dead
        if (!target || target.isAlive === false) {
            ai.fsm.change(new ChaseState(entityId, this.world));
            return;
        }
        
        const targetX = target.container ? target.container.x : target.x;
        const targetY = target.container ? target.container.y : target.y;

        const distSq = distanceSq(transform.x, transform.y, targetX, targetY);
        const targetRadius = target.radius ?? 0;
        const engageRange = ai.attackRange + targetRadius;

        // Tolerance for leaving attack range
        if (distSq > engageRange * engageRange * config.attackExitRangeMultiplier) {
            ai.fsm.change(new ChaseState(entityId, this.world));
            return;
        }

        ai.attackTimer -= delta.deltaMS;
        if (ai.attackTimer <= 0) {
            ai.attackTimer = ai.attackCooldown;

            // Apply damage based on target type
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
