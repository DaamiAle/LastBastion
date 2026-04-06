import { State } from '../../engine/State.js';
import { distanceSq } from '../../engine/utils.js';
import { ChaseState } from './ChaseState.js';

export class AttackState extends State {
    enter() {
        this.cooldown = 0;
    }

    update(delta) {
        const zombie = this.owner;

        if (!zombie.target) {
            zombie.fsm.change(new ChaseState(zombie));
            return;
        }

        const zx = zombie.container.x;
        const zy = zombie.container.y;

        const tx = zombie.target.container.x;
        const ty = zombie.target.container.y;

        const distSq = distanceSq(zx, zy, tx, ty);
        const attackRangeSq = zombie.attackRange * zombie.attackRange;

        // 🔥 si se aleja → volver a chase
        if (distSq > attackRangeSq) {
            zombie.fsm.change(new ChaseState(zombie));
            return;
        }

        // 🔥 cooldown de ataque
        this.cooldown -= delta.deltaTime;

        if (this.cooldown <= 0) {
            this.cooldown = zombie.attackCooldown;

            // aplicar daño
            if (zombie.target.takeDamage) {
                zombie.target.takeDamage(zombie.damage);
            }
        }
    }
}