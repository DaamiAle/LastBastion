import { Component } from '../../engine/ecs/Component.js';

export class Velocity extends Component {
    constructor(dx = 0, dy = 0, speed = 0) {
        super();
        this.dx = dx;
        this.dy = dy;
        this.speed = speed;
    }
}
