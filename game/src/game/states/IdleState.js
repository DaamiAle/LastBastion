import { State } from '../../engine/State.js';
import { ChaseState } from './ChaseState.js';

export class IdleState extends State {
    update() {
        const zombie = this.owner;
        const stimulus = zombie.scene.findZombieStimulus(zombie);

        zombie.target = stimulus.entity ?? null;
        zombie.targetPoint = stimulus.point ?? null;
        zombie.lastHeardNoiseId = stimulus.noiseId ?? null;
        zombie.fsm.change(new ChaseState(zombie));
    }
}
