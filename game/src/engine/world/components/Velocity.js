// src/engine/world/components/Velocity.js
export class Velocity {
    constructor(x = 0, y = 0, options = {}) {
        this.x = x;
        this.y = y;
        // Si true, el Transform rotará para mirar en la dirección del movimiento
        this.faceMovement = options.faceMovement || false;
    }
}