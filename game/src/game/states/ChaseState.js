import { State } from '../../engine/core/State.js';
import { distanceSq } from '../../engine/utils/Utils.js';
import { AttackState } from './AttackState.js';
import { ZombieAIComponent } from '../components/ZombieAIComponent.js';
import { Transform } from '../components/Transform.js';
import { BoidComponent } from '../components/BoidComponent.js';

export class ChaseState extends State {
    constructor(owner, world) {
        super(owner);
        this.world = world;
    }

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
            radius: ai.radius
        };

        const stimulus = scene.findZombieStimulus(pseudoZombie);

        ai.target = stimulus.entity ?? null;
        ai.targetPoint = stimulus.point ?? null;
        ai.lastHeardNoiseId = stimulus.noiseId ?? null;

        if (ai.target) {
            const targetRadius = ai.target.radius ?? 0;
            const engageRange = ai.attackRange + targetRadius;
            
            const targetX = ai.target.container ? ai.target.container.x : ai.target.x;
            const targetY = ai.target.container ? ai.target.container.y : ai.target.y;
            
            const distSq = distanceSq(transform.x, transform.y, targetX, targetY);

            if (distSq <= engageRange * engageRange) {
                ai.fsm.change(new AttackState(entityId, this.world));
                return;
            }
        }

        const targetX = ai.target ? (ai.target.container ? ai.target.container.x : ai.target.x) : ai.targetPoint.x;
        const targetY = ai.target ? (ai.target.container ? ai.target.container.y : ai.target.y) : ai.targetPoint.y;

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
