/**
 * ResourcePlugin
 * 
 * Plugin que proporciona un gestor de recursos centralizado.
 * 
 * Responsabilidades:
 * - Crear ResourceManager
 * - Inyectarlo en el Runtime
 * - Limpiar recursos al salir de escenas
 */

import { Plugin } from './Plugin.js';
import { ResourceManager } from '../resources/ResourceManager.js';

export class ResourcePlugin extends Plugin {
    constructor() {
        super('ResourcePlugin', '1.0.0');
        this.resourceManager = null;
    }

    /**
     * Instalar plugin
     */
    async install(engine) {
        if (!engine.assets) {
            throw new Error('ResourcePlugin: AssetLoader no disponible en Runtime');
        }

        // Crear ResourceManager
        this.resourceManager = new ResourceManager(engine.assets);

        // Inyectar en engine
        engine.resources = this.resourceManager;

        await super.install(engine);
    }

    /**
     * Desinstalar plugin
     */
    async uninstall(engine) {
        // Limpiar todos los recursos
        if (this.resourceManager) {
            this.resourceManager.clear();
        }

        if (engine.resources === this.resourceManager) {
            engine.resources = null;
        }

        await super.uninstall(engine);
    }

    /**
     * Obtener el gestor de recursos
     */
    getResourceManager() {
        return this.resourceManager;
    }
}
