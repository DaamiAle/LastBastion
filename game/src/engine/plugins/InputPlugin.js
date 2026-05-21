/**
 * InputPlugin
 * 
 * Plugin que proporciona sistema de input.
 * 
 * Responsabilidades:
 * - Gestionar InputService
 * - Registrar InputSystem en escenas
 */

import { Plugin } from './Plugin.js';
import { InputSystem } from '../system/InputSystem.js';

export class InputPlugin extends Plugin {
    constructor() {
        super('InputPlugin', '1.0.0');
    }

    /**
     * Instalar plugin
     */
    async install(engine) {
        // El InputService ya existe en Runtime
        // Este plugin solo facilita su uso

        if (!engine.input) {
            throw new Error('InputPlugin: InputService no disponible en Runtime');
        }

        // Almacenar referencia
        engine.inputPlugin = this;

        await super.install(engine);
    }

    /**
     * Desinstalar plugin
     */
    async uninstall(engine) {
        if (engine.inputPlugin === this) {
            engine.inputPlugin = null;
        }

        await super.uninstall(engine);
    }

    /**
     * Crear InputSystem para una escena
     */
    createInputSystem(inputService) {
        return new InputSystem(inputService);
    }
}
