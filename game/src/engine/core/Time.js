/**
 * Time management system.
 * Handles delta time calculations, time scaling, and pausing mechanics.
 */
export class Time {
    constructor() {
        /** @type {number} The time passed since the last frame (in milliseconds), considering timeScale */
        this.deltaTime = 0;
        
        /** @type {number} Global time multiplier (e.g. 1.0 = normal, 0.5 = slow motion) */
        this.timeScale = 1.0;
        
        /** @type {boolean} Flag indicating if time is globally paused */
        this.isPaused = false;
        
        /** @type {number} Total elapsed game time in milliseconds */
        this.elapsed = 0;
    }

    /**
     * Updates the time state based on the current frame's raw delta.
     * @param {Object} ticker The PixiJS ticker or similar object providing deltaMS
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
     * Pauses global time advancement.
     */
    pause() {
        this.isPaused = true;
    }

    /**
     * Resumes global time advancement.
     */
    resume() {
        this.isPaused = false;
    }

    /**
     * Toggles the global pause state.
     */
    togglePause() {
        this.isPaused = !this.isPaused;
    }

    /**
     * Changes the global time scale multiplier.
     * @param {number} scale The new time scale
     */
    setSpeed(scale) {
        this.timeScale = scale;
    }
}
