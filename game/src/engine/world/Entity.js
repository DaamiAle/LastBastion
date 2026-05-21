/**
 * Entity
 * 
 * Contenedor de componentes.
 * Notifica cambios al QueryManager de la escena.
 */

import { Lifecycle } from '../core/Lifecycle.js';
let nextId = 1;

export class Entity extends Lifecycle {
    constructor() {
        super();
        this.id = nextId++;
        this.components = new Map();
        this.active = true;
        
        // Callback para notificar cambios al QueryManager
        this._queryManager = null;
    }

    /**
     * Establecer el QueryManager (llamado por Scene)
     * @internal
     */
    setQueryManager(queryManager) {
        this._queryManager = queryManager;
    }

    add(component) {
        this.components.set(component.constructor.name, component);
        
        // Notificar al QueryManager
        if (this._queryManager) {
            this._queryManager.addComponentToIndex(this, component.constructor);
        }
        
        return this;
    }

    get(componentClass) {
        return this.components.get(componentClass.name);
    }

    has(componentClass) {
        return this.components.has(componentClass.name);
    }

    destroy() {
        this.components.clear();
        this.active = false;
    }
}