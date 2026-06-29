import { Component } from '../../engine/ecs/Component.js';

export class DamageQueueComponent extends Component {
    constructor() {
        super();
        this.damages = [];
    }

    addDamage(amount) {
        this.damages.push(amount);
    }
}
