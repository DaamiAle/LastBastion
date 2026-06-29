import { Component } from '../../engine/ecs/Component.js';

export class Health extends Component {
    constructor(maxHp = 100) {
        super();
        this.maxHp = maxHp;
        this.hp = maxHp;
        this.isAlive = true;
    }
}
