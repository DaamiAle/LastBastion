/**
 * Sistema de administración del tiempo.
 * Maneja los cálculos de tiempo delta, escalado de tiempo (time scaling), y mecánicas de pausa.
 */
export class Time {
    constructor() {
        /** @type {number} El tiempo transcurrido desde el último fotograma (en milisegundos), considerando el timeScale */
        this.deltaTime = 0;
        
        /** @type {number} Multiplicador de tiempo global (ej. 1.0 = normal, 0.5 = cámara lenta) */
        this.timeScale = 1.0;
        
        /** @type {boolean} Indicador (flag) de si el tiempo está pausado globalmente */
        this.isPaused = false;
        
        /** @type {number} Tiempo total de juego transcurrido en milisegundos */
        this.elapsed = 0;
    }

    /**
     * Actualiza el estado del tiempo basándose en el delta crudo del fotograma actual.
     * @param {Object} ticker El ticker de PixiJS u objeto similar que provee deltaMS
     */
    update(ticker) {
        if (this.isPaused) {
            this.deltaTime = 0;
        } else {
            this.deltaTime = ticker.deltaMS * this.timeScale;
            this.elapsed += this.deltaTime;
        }
    }

    /**
     * Pausa el avance global del tiempo.
     */
    pause() {
        this.isPaused = true;
    }

    /**
     * Reanuda el avance global del tiempo.
     */
    resume() {
        this.isPaused = false;
    }

    /**
     * Alterna (toggles) el estado global de pausa.
     */
    togglePause() {
        this.isPaused = !this.isPaused;
    }

    /**
     * Cambia el multiplicador global de la escala de tiempo.
     * @param {number} scale La nueva escala de tiempo
     */
    setSpeed(scale) {
        this.timeScale = scale;
    }
}
