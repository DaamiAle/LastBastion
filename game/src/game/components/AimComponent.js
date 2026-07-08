import { Component } from '../../engine/ecs/Component.js';

/**
 * Component that holds a reference to a sprite barrel that needs to be rotated to aim at targets.
 */
export class AimComponent extends Component {
    /**
     * @param {import('pixi.js').Sprite} barrelSprite The PixiJS sprite representing the gun barrel
     */
    constructor(barrelSprite) {
        super();
        /** @type {import('pixi.js').Sprite} */
        this.barrelSprite = barrelSprite;
    }
}
