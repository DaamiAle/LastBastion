import { Vector2 } from '../../math/Vector2.js';

export class Transform {
    constructor() {
        this.position = new Vector2();
        this.scale = new Vector2(1, 1);
        this.rotation = 0; // en radianes
    }
}