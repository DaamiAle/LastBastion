import { Component } from '../../engine/ecs/Component.js';

/**
 * Vincula una entidad del ECS a su representación visual en PixiJS.
 */
export class SpriteComponent extends Component {
    /**
     * @param {import('pixi.js').Container} container El contenedor o sprite raíz de PixiJS para esta entidad
     */
    constructor(container) {
        super();
        /** @type {import('pixi.js').Container} */
        this.container = container; 
    }
}
