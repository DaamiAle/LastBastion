// src/engine/services/InputService.js

export class InputService {
    constructor() {
        this.keys = new Set();
        this.prevKeys = new Set();

        window.addEventListener('keydown', (e) => {
            this.keys.add(e.code);
        });

        window.addEventListener('keyup', (e) => {
            this.keys.delete(e.code);
        });
    }

    update() {
        this.prevKeys = new Set(this.keys);
    }

    isDown(key) {
        return this.keys.has(key);
    }

    wasPressed(key) {
        return this.keys.has(key) && !this.prevKeys.has(key);
    }

    wasReleased(key) {
        return !this.keys.has(key) && this.prevKeys.has(key);
    }
}