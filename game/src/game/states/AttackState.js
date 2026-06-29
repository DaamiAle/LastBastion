import { State } from '../../engine/State.js';
import { distanceSq } from '../../engine/Utils.js';
import { ChaseState } from './ChaseState.js';

export class AttackState extends State {
    enter() {
        this.cooldown = 0;
    }

    update(delta) {
        const zombie = this.owner;
        const config = zombie.scene.game.config.zombies;
        const target = zombie.target;

        if (!target || !target.isAlive) {
            zombie.fsm.change(new ChaseState(zombie));
            return;
        }

        const distSq = distanceSq(
            zombie.container.x,
            zombie.container.y,
            target.container.x,
            target.container.y
        );
        const targetRadius = target.radius ?? 0;
        const engageRange = zombie.attackRange + targetRadius;

        if (distSq > engageRange * engageRange * config.attackExitRangeMultiplier) {
            zombie.fsm.change(new ChaseState(zombie));
            return;
        }

        zombie.scene.keepEntityOutsideFortress(zombie, 6);

        this.cooldown -= delta.deltaMS;
        if (this.cooldown <= 0) {
            this.cooldown = zombie.attackCooldown;

            if (target.canTakeDamage) {
                target.takeDamage(zombie.damage);
            }
        }
    }
}
