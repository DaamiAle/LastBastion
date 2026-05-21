//src/engine/core/Config.js
export class Config {
    constructor(options = {}) {
        this.width = options.width ?? 1280;
        this.height = options.height ?? 720;
        this.backgroundColor = options.backgroundColor ?? 0x111111;
    }
}