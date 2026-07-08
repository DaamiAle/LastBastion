import { Component } from '../../engine/ecs/Component.js';

/**
 * Defines physical and combat properties for projectiles.
 */
export class ProjectileComponent extends Component {
    /**
     * @param {number} startX The origin X position where the projectile was fired
     * @param {number} startY The origin Y position where the projectile was fired
     * @param {number} damage How much health to subtract from the target on hit
     * @param {number} maxDistance The maximum travel distance before the projectile fizzles out
     * @param {number} splashRadius If > 0, the projectile damages an area upon impact
     * @param {number} hitRadius The physical collision radius of the projectile itself
     */
    constructor(startX, startY, damage, maxDistance, splashRadius, hitRadius = 2) {
        super();
        /** @type {number} */
        this.startX = startX;
        /** @type {number} */
        this.startY = startY;
        /** @type {number} */
        this.damage = damage;
        /** @type {number} */
        this.maxDistance = maxDistance;
        /** @type {number} */
        this.splashRadius = splashRadius;
        /** @type {number} */
        this.hitRadius = hitRadius;
    }
}
