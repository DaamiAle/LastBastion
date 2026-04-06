import { State } from '../../engine/State.js';
import { distanceSq } from '../../engine/Utils.js';
import { IdleState } from './IdleState.js';
import { AttackState } from './AttackState.js';

export class ChaseState extends State {

    update(delta) {
        const zombie = this.owner;

        // 🔴 sin target → volver a idle
        if (!zombie.target) {
            zombie.fsm.change(new IdleState(zombie));
            return;
        }

        const zx = zombie.container.x;
        const zy = zombie.container.y;

        const tx = zombie.target.container.x;
        const ty = zombie.target.container.y;

        const dx = tx - zx;
        const dy = ty - zy;

        const distSq = distanceSq(zx, zy, tx, ty);

        // 🔴 rango máximo (perder target)
        const maxRangeSq = zombie.detectionRadius * zombie.detectionRadius * 1.5;

        if (distSq > maxRangeSq) {
            zombie.target = null;
            zombie.fsm.change(new IdleState(zombie));
            return;
        }

        // 🔴 entrar en ataque
        const attackRangeSq = zombie.attackRange * zombie.attackRange;

        if (distSq < attackRangeSq) {
            zombie.fsm.change(new AttackState(zombie));
            return;
        }

        // 🔴 evitar división por 0
        if (distSq === 0) return;

        // 🔥 normalización (único sqrt necesario)
        const dist = Math.sqrt(distSq);

        const dirX = dx / dist;
        const dirY = dy / dist;

        const speed = zombie.speed * (delta.deltaTime / 60);

        zombie.container.x += dirX * speed;
        zombie.container.y += dirY * speed;
    }
}