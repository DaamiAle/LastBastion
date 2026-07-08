import { System } from '../../engine/ecs/System.js';
import { ZombieAIComponent } from '../components/ZombieAIComponent.js';

/**
 * Propagates logic updates to the zombie Finite State Machine.
 */
export class ZombieAISystem extends System {
    /**
     * @param {Object} delta Time delta object
     */
    update(delta) {
        const entities = this.world.getEntitiesWith(ZombieAIComponent);
        for (const entityId of entities) {
            const ai = this.world.getComponent(entityId, ZombieAIComponent);
            if (ai.fsm) {
                // FSM manages states (Idle, Chase, Attack)
                ai.fsm.update(delta);
            }
        }
    }
}
