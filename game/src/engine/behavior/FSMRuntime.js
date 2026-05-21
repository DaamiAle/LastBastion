/**
 * FSMRuntime
 * 
 * Máquina de estados simple y desacoplada.
 * Agnóstica del gameplay.
 * 
 * Uso:
 *   const fsm = new FSMRuntime('idle', { idle, walk });
 *   fsm.setState('walk');
 *   fsm.update(delta);
 */

export class FSMRuntime {
    /**
     * @param {string} initialState - Estado inicial
     * @param {Object} stateDefinitions - Mapa de { stateName: stateObject }
     */
    constructor(initialState, stateDefinitions = {}) {
        this.currentState = initialState;
        this.stateDefinitions = stateDefinitions;
        this.nextState = null;
        this.previousState = null;
        
        // Historial de cambios (opcional, para debugging)
        this.history = [initialState];
        
        // Callbacks opcionales
        this.onEnter = null;
        this.onExit = null;
        this.onUpdate = null;
        
        // Entrada al estado inicial
        if (stateDefinitions[initialState]?.onEnter) {
            stateDefinitions[initialState].onEnter(this);
        }
    }

    /**
     * Cambiar estado
     * @param {string} newState
     */
    setState(newState) {
        if (!this.stateDefinitions[newState]) {
            console.warn(`FSMRuntime: Estado desconocido: ${newState}`);
            return;
        }

        if (this.currentState === newState) return;

        this.previousState = this.currentState;
        this.nextState = newState;
    }

    /**
     * Actualizar FSM
     * @param {number} delta - Tiempo en segundos
     */
    update(delta) {
        // Procesar cambio de estado
        if (this.nextState) {
            const oldState = this.currentState;
            const newState = this.nextState;
            this.nextState = null;

            // Salida del estado anterior
            const oldDef = this.stateDefinitions[oldState];
            if (oldDef?.onExit) {
                oldDef.onExit(this);
            }
            if (this.onExit) {
                this.onExit(oldState, newState);
            }

            // Entrada al nuevo estado
            const newDef = this.stateDefinitions[newState];
            if (newDef?.onEnter) {
                newDef.onEnter(this);
            }
            if (this.onEnter) {
                this.onEnter(newState, oldState);
            }

            this.currentState = newState;
            this.history.push(newState);
        }

        // Actualización del estado actual
        const stateDef = this.stateDefinitions[this.currentState];
        if (stateDef?.onUpdate) {
            stateDef.onUpdate(this, delta);
        }
        if (this.onUpdate) {
            this.onUpdate(this.currentState, delta);
        }
    }

    /**
     * Obtener estado actual
     */
    getState() {
        return this.currentState;
    }

    /**
     * Verificar si está en un estado específico
     */
    isInState(state) {
        return this.currentState === state;
    }

    /**
     * Obtener estado anterior
     */
    getPreviousState() {
        return this.previousState;
    }

    /**
     * Agregar definición de estado dinámicamente
     */
    addState(name, definition) {
        this.stateDefinitions[name] = definition;
    }

    /**
     * Limpiar
     */
    destroy() {
        this.stateDefinitions = {};
        this.history = [];
        this.onEnter = null;
        this.onExit = null;
        this.onUpdate = null;
    }
}
