import { Component } from '../../engine/ecs/Component.js';

export class ProjectileComponent extends Component {
    constructor(startX, startY, damage, maxDistance, splashRadius, hitRadius = 2) {
        super();
        this.startX = startX;
        this.startY = startY;
        this.damage = damage;
        this.maxDistance = maxDistance;
        this.splashRadius = splashRadius;
        this.hitRadius = hitRadius;
    }
}
