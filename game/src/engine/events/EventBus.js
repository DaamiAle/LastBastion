/**
 * EventBus
 * 
 * Sistema de eventos desacoplado.
 * Los systems se comunican mediante eventos.
 * NO hay callbacks mágicos ni referencias directas entre systems.
 */

export class EventBus {
    constructor() {
        // Map<eventName, Set<callback>>
        this.listeners = new Map();
    }

    /**
     * Suscribirse a un evento
     * @param {string} eventName
     * @param {Function} callback
     */
    on(eventName, callback) {
        if (!this.listeners.has(eventName)) {
            this.listeners.set(eventName, new Set());
        }
        this.listeners.get(eventName).add(callback);
    }

    /**
     * Desuscribirse de un evento
     * @param {string} eventName
     * @param {Function} callback
     */
    off(eventName, callback) {
        if (this.listeners.has(eventName)) {
            this.listeners.get(eventName).delete(callback);
        }
    }

    /**
     * Suscribirse una sola vez a un evento
     * @param {string} eventName
     * @param {Function} callback
     */
    once(eventName, callback) {
        const wrappedCallback = (data) => {
            callback(data);
            this.off(eventName, wrappedCallback);
        };
        this.on(eventName, wrappedCallback);
    }

    /**
     * Emitir un evento
     * @param {string} eventName
     * @param {*} data - Payload del evento
     */
    emit(eventName, data) {
        if (this.listeners.has(eventName)) {
            for (const callback of this.listeners.get(eventName)) {
                try {
                    callback(data);
                } catch (error) {
                    console.error(`Error en evento "${eventName}":`, error);
                }
            }
        }
    }

    /**
     * Limpiar todos los listeners
     */
    clear() {
        this.listeners.clear();
    }

    /**
     * Limpiar listeners de un evento específico
     * @param {string} eventName
     */
    clearEvent(eventName) {
        this.listeners.delete(eventName);
    }
}
