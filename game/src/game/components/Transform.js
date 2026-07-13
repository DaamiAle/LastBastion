import { Component } from '../../engine/ecs/Component.js';

/**
 * Almacena la posición 2D en el mundo y la rotación de una entidad.
 */
export class Transform extends Component {
    /**
     * @param {number} x La coordenada X
     * @param {number} y La coordenada Y
     * @param {number} rotation La rotación en radianes
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
