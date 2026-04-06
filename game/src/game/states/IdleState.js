import { State } from '../../engine/State.js';
import { ChaseState } from './ChaseState.js';
import { distanceSq } from '../../engine/utils.js';

export class IdleState extends State {
    update(delta) {
        const zombie = this.owner;
        const scene = zombie.scene;

        const zx = zombie.container.x;
        const zy = zombie.container.y;

        const radiusSq = zombie.detectionRadius * zombie.detectionRadius;

        // 🔥 detectar player
        const player = scene.entities.find(e => e.type === "player");

        if (player) {
            const px = player.container.x;
            const py = player.container.y;

            if (distanceSq(zx, zy, px, py) < radiusSq) {
                zombie.target = player;
                zombie.fsm.change(new ChaseState(zombie));
                return;
            }
        }

        // 🔥 detectar fortress
        const fortress = scene.fortress;

        if (fortress) {
            const fx = fortress.container.x;
            const fy = fortress.container.y;

            if (distanceSq(zx, zy, fx, fy) < radiusSq) {
                zombie.target = fortress;
                zombie.fsm.change(new ChaseState(zombie));
                return;
            }
        }
    }
}