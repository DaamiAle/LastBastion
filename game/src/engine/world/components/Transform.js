// src/engine/world/components/Transform.js
import { Vector2 } from '../../math/Vector2.js';

export class Transform {
    constructor() {
        this.position = new Vector2();
        this.scale = new Vector2(1, 1);
        this.rotation = 0; // en radianes
    }

    setPosition(x, y) {
        this.position.set(x, y);
        return this;
    }

    setScale(x, y) {
        this.scale.set(x, y);
        return this;
    }

    setRotation(angle) {
        this.rotation = angle;
        return this;
    }

}