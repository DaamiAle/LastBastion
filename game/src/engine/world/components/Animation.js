// src/engine/world/components/Animation.js
export class Animation {
    constructor(clips = {}) {
        this.clips = clips; 

        this.current = null; // name
        this.frameIndex = 0;
        this.elapsed = 0;
    }

    play(name) {
        if (this.current === name) return;

        if (!this.clips[name]) {
            console.warn(`Animation.play: clip '${name}' not found`);
            return;
        }

        this.current = name;
        this.frameIndex = 0;
        this.elapsed = 0;
    }

    get clip() {
        return this.clips[this.current] ?? null;
    }

    get currentFrame() {
        const c = this.clip;
        return c && c.frames.length > 0
            ? c.frames[this.frameIndex]
            : null;
    }
}