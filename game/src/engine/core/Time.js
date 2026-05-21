// src/engine/core/Time.js
export class Time {
    constructor() {
        this.deltaTime = 0;     // segundos (game time)
        this.elapsed = 0;

        this.timeScale = 1;
    }

    update(deltaMS) {
        // convertir tiempo real (pixi) a segundos
        let rawDelta = deltaMS / 1000;

        // evitar saltos grandes (tab inactive, lag, etc)
        if (rawDelta > 0.1) rawDelta = 0.1;

        // aplicar time scale
        this.deltaTime = rawDelta * this.timeScale;

        // acumular tiempo transcurrido
        this.elapsed += this.deltaTime;
    }

    setScale(scale) {
        this.timeScale = scale;
    }
}