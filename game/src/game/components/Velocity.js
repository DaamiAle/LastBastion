import { Component } from '../../engine/ecs/Component.js';

/**
 * Stores movement properties for an entity.
 */
export class Velocity extends Component {
    /**
     * @param {number} dx Normalized X direction vector (-1 to 1)
     * @param {number} dy Normalized Y direction vector (-1 to 1)
     * @param {number} speed Magnitude of velocity in pixels per frame
     */
    constructor(dx = 0, dy = 0, speed = 0) {
        super();
        /** @type {number} */
        this.dx = dx;
        /** @type {number} */
        this.dy = dy;
        /** @type {number} */
        this.speed = speed;
    }
}
