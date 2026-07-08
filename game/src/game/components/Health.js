import { Component } from '../../engine/ecs/Component.js';

/**
 * Component that tracks an entity's health points.
 */
export class Health extends Component {
    /**
     * @param {number} maxHp The maximum and starting health points
     */
    constructor(maxHp = 100) {
        super();
        /** @type {number} The maximum health capacity */
        this.maxHp = maxHp;
        
        /** @type {number} The current health points */
        this.hp = maxHp;
        
        /** @type {boolean} Flag indicating if the entity is still alive */
        this.isAlive = true;
    }
}
