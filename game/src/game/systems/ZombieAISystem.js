import { System } from '../../engine/ecs/System.js';
import { ZombieAIComponent } from '../components/ZombieAIComponent.js';

/**
 * Propaga las actualizaciones de lógica a la Máquina de Estados Finitos del zombie.
 */
export class ZombieAISystem extends System {
    /**
     * @param {Object} delta Objeto delta de tiempo
     */
    update(delta) {
        const entities = this.world.getEntitiesWith(ZombieAIComponent);
        for (const entityId of entities) {
            const ai = this.world.getComponent(entityId, ZombieAIComponent);
            if (ai.fsm) {
                // La FSM maneja los estados (Idle, Chase, Attack)
                ai.fsm.update(delta);
            }
        }
    }
}
