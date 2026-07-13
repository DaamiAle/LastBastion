/**
 * Administrador de la Máquina de Estados Finitos (FSM - Finite State Machine).
 * Maneja las transiciones de estado y propaga las llamadas de actualización al estado activo.
 */
export class FSM {
    /**
     * @param {Object} owner La entidad u objeto que posee esta FSM
     */
    constructor(owner) {
        /** @type {Object} El propietario del contexto de la FSM */
        this.owner = owner;
        /** @type {State|null} El estado actualmente activo */
        this.current = null;
    }

    /**
     * Cambia el estado actual a un nuevo estado.
     * Llama a exit() en el estado antiguo y enter() en el nuevo.
     * @param {State} state El nuevo estado al que transicionar
     */
    change(state) {
        if (this.current) {
            this.current.exit();
        }

        this.current = state;

        if (this.current) {
            this.current.enter();
        }
    }

    /**
     * Actualiza el estado actualmente activo.
     * @param {Object} delta Objeto que contiene información de tiempo delta
     */
    update(delta) {
        if (this.current) {
            this.current.update(delta);
        }
    }
}