import { Component } from '../../engine/ecs/Component.js';

/**
 * Almacena las propiedades de movimiento de una entidad.
 */
export class Velocity extends Component {
    /**
     * @param {number} dx Vector de dirección X normalizado (-1 a 1)
     * @param {number} dy Vector de dirección Y normalizado (-1 a 1)
     * @param {number} speed Magnitud de la velocidad en píxeles por fotograma
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
