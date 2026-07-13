import { Application } from 'pixi.js';

/**
 * Maneja la inicialización y administración de la aplicación PixiJS y el canvas.
 */
export class Renderer {
    /**
     * @param {Object} config Configuración global del juego que contiene el ancho, alto y color de la app
     */
    constructor(config) {
        /** @type {Application} La instancia principal de la Aplicación PixiJS */
        this.app = new Application();
        /** @type {Object} El objeto de configuración */
        this.config = config;
    }

    /**
     * Inicializa de manera asíncrona la aplicación PixiJS, configura el canvas, 
     * y lo adjunta (appends) al DOM.
     * @returns {Promise<void>}
     */
    async init() {
        await this.app.init({
            width: this.config.app.width,
            height: this.config.app.height,
            backgroundColor: this.config.app.backgroundColor
        });

        document.body.appendChild(this.app.canvas);
        
        /** @type {import('pixi.js').Container} Expone el escenario raíz (root stage) principal para facilitar el acceso */
        this.stage = this.app.stage;
    }

    /**
     * Ayudante (Helper) para obtener el elemento canvas HTML.
     * @returns {HTMLCanvasElement} El elemento canvas subyacente
     */
    get canvas() {
        return this.app.canvas;
    }
}
