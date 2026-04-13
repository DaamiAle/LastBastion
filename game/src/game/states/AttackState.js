import { State } from '../../engine/State.js';
import { distanceSq } from '../../engine/Utils.js';
import { ChaseState } from './ChaseState.js';

export class AttackState extends State {
    enter() {
        // el ataque se ejecuta inmediatamente al entrar, luego el cooldown controla la cadencia
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
        this.cooldown -= delta.deltaMS;

        if (this.cooldown <= 0) {
            this.cooldown = zombie.attackCooldown;

            // aplicar daño
            if (zombie.target.canTakeDamage) {
                zombie.target.takeDamage(zombie.damage);
            }
        }
    }
}