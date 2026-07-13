import { State } from '../../engine/core/State.js';
import { distanceSq } from '../../engine/utils/Utils.js';
import { AttackState } from './AttackState.js';
import { ZombieAIComponent } from '../components/ZombieAIComponent.js';
import { Transform } from '../components/Transform.js';
import { BoidComponent } from '../components/BoidComponent.js';

/**
 * El estado de persecución para un zombie.
 * Manejado dentro de la FSM, persigue jugadores, edificios o ruidos.
 */
export class ChaseState extends State {
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
    update(delta) {
        const entityId = this.owner;
        const ai = this.world.getComponent(entityId, ZombieAIComponent);
        const transform = this.world.getComponent(entityId, Transform);
        const boid = this.world.getComponent(entityId, BoidComponent);
        
        if (!ai || !transform || !ai.scene) return;

        const scene = ai.scene;
        
        const pseudoZombie = {
            container: { x: transform.x, y: transform.y },
            lastHeardNoiseId: ai.lastHeardNoiseId,
            radius: ai.radius,
            detectionRadius: ai.detectionRadius,
            wanderTimer: ai.wanderTimer,
            wanderAngle: ai.wanderAngle,
            targetPoint: ai.targetPoint
        };

        const stimulus = scene.findZombieStimulus(pseudoZombie);

        ai.target = stimulus.entity ?? null;
        ai.targetPoint = stimulus.point ?? null;
        ai.lastHeardNoiseId = stimulus.noiseId ?? null;

        ai.wanderTimer = pseudoZombie.wanderTimer;
        ai.wanderAngle = pseudoZombie.wanderAngle;
        if (pseudoZombie.targetPoint) {
            ai.targetPoint = pseudoZombie.targetPoint;
        }

        let targetX, targetY;
        if (ai.target) {
            if (typeof ai.target === 'number') {
                const targetTransform = this.world.getComponent(ai.target, Transform);
                if (targetTransform) {
                    targetX = targetTransform.x;
                    targetY = targetTransform.y;
                } else {
                    targetX = transform.x;
                    targetY = transform.y;
                }
            } else {
                targetX = ai.target.container ? ai.target.container.x : ai.target.x;
                targetY = ai.target.container ? ai.target.container.y : ai.target.y;
            }
            
            const targetRadius = ai.target.radius ?? 0;
            const engageRange = ai.attackRange + targetRadius;
            
            const distSq = distanceSq(transform.x, transform.y, targetX, targetY);

            if (distSq <= engageRange * engageRange) {
                ai.fsm.change(new AttackState(entityId, this.world));
                return;
            }
        } else {
            targetX = ai.targetPoint.x;
            targetY = ai.targetPoint.y;
        }

        const dx = targetX - transform.x;
        const dy = targetY - transform.y;
        const dist = Math.hypot(dx, dy) || 1;

        if (boid) {
            boid.targetDirectionX = dx / dist;
            boid.targetDirectionY = dy / dist;
            boid.stimulusKind = stimulus.kind;
        }
    }
}
