/**
 * StateMachineSystem
 * 
 * System que actualiza todos los StateMachine components.
 * Permite que las FSMs evolucionen en cada frame.
 * 
 * Las FSMs dentro de StateMachine no tienen lógica de gameplay.
 * El gameplay reacciona a cambios de estado escuchando eventos.
 */

import { StateMachine } from '../world/components/StateMachine.js';

export class StateMachineSystem {
    /**
     * Actualizar todas las máquinas de estado
     */
    update(entities, delta) {
        for (const entity of entities) {
            if (!entity.active) continue;

            const sm = entity.get(StateMachine);
            if (!sm) continue;

            // Actualizar todas las FSMs del StateMachine component
            sm.update(delta);
        }
    }

    /**
     * Destruir el system
     */
    destroy() {
        // El system no mantiene estado global
    }
}