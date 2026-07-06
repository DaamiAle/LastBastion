import { Component } from '../../engine/ecs/Component.js';

export class ZombieAIComponent extends Component {
    constructor(fsm) {
        super();
        this.fsm = fsm;
        this.scene = null;
        this.target = null;
        this.targetPoint = null;
        this.lastHeardNoiseId = null;
        this.attackRange = 0;
        this.attackCooldown = 0;
        this.attackTimer = 0;
        this.damage = 0;
        this.radius = 0;
        this.detectionRadius = 0;
        this.wanderTimer = 0;
        this.wanderAngle = 0;
    }
}
