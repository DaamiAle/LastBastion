import { System } from '../../engine/ecs/System.js';
import { ZombieAIComponent } from '../components/ZombieAIComponent.js';

export class ZombieAISystem extends System {
    update(delta) {
        const entities = this.world.getEntitiesWith(ZombieAIComponent);
        for (const entityId of entities) {
            const ai = this.world.getComponent(entityId, ZombieAIComponent);
            if (ai.fsm) {
                // El FSM maneja los estados (Idle, Chase, Attack)
                // En la Fase 4 lo conectaremos completamente a los componentes puros.
                ai.fsm.update(delta);
            }
        }
    }
}
