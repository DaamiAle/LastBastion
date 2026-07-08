import { Application } from 'pixi.js';

/**
 * Handles initialization and management of the PixiJS application and canvas.
 */
export class Renderer {
    /**
     * @param {Object} config Global game configuration containing app width, height, and color
     */
    constructor(config) {
        /** @type {Application} The core PixiJS Application instance */
        this.app = new Application();
        /** @type {Object} The configuration object */
        this.config = config;
    }

    /**
     * Asynchronously initializes the PixiJS application, sets up the canvas, 
     * and appends it to the DOM.
     * @returns {Promise<void>}
     */
    async init() {
        await this.app.init({
            width: this.config.app.width,
            height: this.config.app.height,
            backgroundColor: this.config.app.backgroundColor
        });

        document.body.appendChild(this.app.canvas);
        
        /** @type {import('pixi.js').Container} Expose the main root stage for easy access */
        this.stage = this.app.stage;
    }

    /**
     * Helper to get the HTML canvas element.
     * @returns {HTMLCanvasElement} The underlying canvas element
     */
    get canvas() {
        return this.app.canvas;
    }
}
