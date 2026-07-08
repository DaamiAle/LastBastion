import { Component } from '../../engine/ecs/Component.js';

/**
 * Links an ECS entity to its visual representation in PixiJS.
 */
export class SpriteComponent extends Component {
    /**
     * @param {import('pixi.js').Container} container The root PixiJS container or sprite for this entity
     */
    constructor(container) {
        super();
        /** @type {import('pixi.js').Container} */
        this.container = container; 
    }
}
