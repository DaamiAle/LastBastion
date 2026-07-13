import { State } from '../../engine/core/State.js';
import { ChaseState } from './ChaseState.js';

import { ZombieAIComponent } from '../components/ZombieAIComponent.js';
import { Transform } from '../components/Transform.js';

/**
 * Estado inicial o de espera para un zombie.
 * Transiciona a ChaseState una vez que se procesa el estímulo.
 */
export class IdleState extends State {
    /**
     * @param {number} owner ID de la entidad
     * @param {Object} world El Mundo ECS
     */
    constructor(owner, world) {
        super(owner);
        this.world = world;
    }

    /**
     * @param {Object} delta Objeto delta de tiempo
     */
    update() {
        const entityId = this.owner;
        const ai = this.world.getComponent(entityId, ZombieAIComponent);
        const transform = this.world.getComponent(entityId, Transform);
        
        if (!ai || !transform || !ai.scene) return;

        // Crear un objeto pseudo-zombie para que scene.findZombieStimulus pueda trabajar
        const pseudoZombie = {
            container: { x: transform.x, y: transform.y },
            lastHeardNoiseId: ai.lastHeardNoiseId,
            radius: ai.radius,
            detectionRadius: ai.detectionRadius,
            wanderTimer: ai.wanderTimer,
            wanderAngle: ai.wanderAngle,
            targetPoint: ai.targetPoint
        };

        const stimulus = ai.scene.findZombieStimulus(pseudoZombie);

        ai.target = stimulus.entity ?? null;
        ai.targetPoint = stimulus.point ?? null;
        ai.lastHeardNoiseId = stimulus.noiseId ?? null;
        
        ai.wanderTimer = pseudoZombie.wanderTimer;
        ai.wanderAngle = pseudoZombie.wanderAngle;
        if (pseudoZombie.targetPoint) {
            ai.targetPoint = pseudoZombie.targetPoint;
        }
        
        ai.fsm.change(new ChaseState(entityId, this.world));
    }
}
