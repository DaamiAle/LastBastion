import { Component } from '../../engine/ecs/Component.js';

export class ProjectileComponent extends Component {
    constructor(startX, startY, damage, maxDistance, splashRadius) {
        super();
        this.startX = startX;
        this.startY = startY;
        this.damage = damage;
        this.maxDistance = maxDistance;
        this.splashRadius = splashRadius;
    }
}
