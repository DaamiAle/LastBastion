// src/engine/world/components/Pivot.js

export class Pivot {
    constructor(x = 0.5, y = 0.5) {
        this.x = x;
        this.y = y;
        this.dirty = true;
    }
}