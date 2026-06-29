export class Time {
    constructor() {
        this.deltaTime = 0;
        this.timeScale = 1.0;
        this.isPaused = false;
        this.elapsed = 0;
    }

    update(ticker) {
        if (this.isPaused) {
            this.deltaTime = 0;
        } else {
            this.deltaTime = ticker.deltaMS * this.timeScale;
            this.elapsed += this.deltaTime;
        }
    }

    pause() {
        this.isPaused = true;
    }

    resume() {
        this.isPaused = false;
    }

    togglePause() {
        this.isPaused = !this.isPaused;
    }

    setSpeed(scale) {
        this.timeScale = scale;
    }
}
