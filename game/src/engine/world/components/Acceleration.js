// src/engine/world/components/Acceleration.js

export class Acceleration {
    constructor({
        maxSpeed = 150,
        accel = 800,
        decel = 1000
    } = {}) {
        this.maxSpeed = maxSpeed;
        this.accel = accel;
        this.decel = decel;

        // input normalizado (-1 a 1)
        this.inputX = 0;
        this.inputY = 0;
    }
}