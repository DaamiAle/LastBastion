import { Component } from '../../engine/ecs/Component.js';

/**
 * Componente que guarda una referencia al cañón (sprite) que debe rotarse para apuntar a los objetivos.
 */
export class AimComponent extends Component {
    /**
     * @param {import('pixi.js').Sprite} barrelSprite El sprite de PixiJS que representa el cañón del arma
     */
    constructor(barrelSprite) {
        super();
        /** @type {import('pixi.js').Sprite} */
        this.barrelSprite = barrelSprite;
    }
}
