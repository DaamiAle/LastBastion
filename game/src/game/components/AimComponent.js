import { Component } from '../../engine/ecs/Component.js';

export class AimComponent extends Component {
    constructor(barrelSprite) {
        super();
        this.barrelSprite = barrelSprite;
    }
}
