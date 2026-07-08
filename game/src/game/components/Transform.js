import { Component } from '../../engine/ecs/Component.js';

/**
 * Stores the 2D world position and rotation of an entity.
 */
export class Transform extends Component {
    /**
     * @param {number} x The X coordinate
     * @param {number} y The Y coordinate
     * @param {number} rotation The rotation in radians
     */
    constructor(x = 0, y = 0, rotation = 0) {
        super();
        /** @type {number} */
        this.x = x;
        /** @type {number} */
        this.y = y;
        /** @type {number} */
        this.rotation = rotation;
    }
}
