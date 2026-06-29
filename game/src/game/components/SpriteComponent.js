import { Component } from '../../engine/ecs/Component.js';

export class SpriteComponent extends Component {
    constructor(container) {
        super();
        this.container = container; // The root PIXI container/sprite for this entity
    }
}
