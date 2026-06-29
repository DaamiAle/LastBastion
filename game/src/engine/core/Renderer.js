import { Application } from 'pixi.js';

export class Renderer {
    constructor(config) {
        this.app = new Application();
        this.config = config;
    }

    async init() {
        await this.app.init({
            width: this.config.app.width,
            height: this.config.app.height,
            backgroundColor: this.config.app.backgroundColor
        });

        document.body.appendChild(this.app.canvas);
        
        // Expose stage for easy access
        this.stage = this.app.stage;
    }

    get canvas() {
        return this.app.canvas;
    }
}
