/**
 * PixiRenderPlugin
 * 
 * Plugin que proporciona rendering con PixiJS.
 * 
 * Responsabilidades:
 * - Crear y gestionar el PixiRenderBackend
 * - Registrar RenderSystem en escenas
 */

import { Plugin } from './Plugin.js';
import { PixiRenderBackend } from '../render/PixiRenderBackend.js';
import { RenderSystem } from '../system/RenderSystem.js';

export class PixiRenderPlugin extends Plugin {
    constructor() {
        super('PixiRenderPlugin', '1.0.0');
        this.renderBackend = null;
    }

    /**
     * Instalar plugin
     */
    async install(engine) {
        // El renderBackend ya fue creado en Runtime.init()
        // Este plugin solo registra los sistemas que lo usan

        // Si aún no existe, crear uno
        if (!engine.renderBackend) {
            engine.renderBackend = new PixiRenderBackend(engine.app);
        }

        this.renderBackend = engine.renderBackend;

        // Almacenar referencia al plugin en el engine
        engine.renderPlugin = this;

        await super.install(engine);
    }

    /**
     * Desinstalar plugin
     */
    async uninstall(engine) {
        // Limpiar referencias
        if (engine.renderPlugin === this) {
            engine.renderPlugin = null;
        }

        this.renderBackend = null;

        await super.uninstall(engine);
    }

    /**
     * Obtener backend de rendering
     */
    getBackend() {
        return this.renderBackend;
    }

    /**
     * Crear RenderSystem para una escena
     */
    createRenderSystem(priority = 500) {
        if (!this.renderBackend) {
            throw new Error('PixiRenderPlugin: renderBackend no disponible');
        }
        return new RenderSystem(this.renderBackend);
    }
}
