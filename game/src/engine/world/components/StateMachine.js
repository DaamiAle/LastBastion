/**
 * StateMachine Component
 * 
 * Contenedor de múltiples FSMs independientes en una entidad.
 * Cada FSM maneja un aspecto diferente (animación, AI, combat, etc).
 * 
 * Ejemplo:
 *   const sm = new StateMachine();
 *   sm.add('animation', animFSM);
 *   sm.add('ai', aiFSM);
 *   
 *   sm.get('animation').setState('walk');
 *   sm.update(delta);
 */

export class StateMachine {
    constructor() {
        // Map<fsmName, FSMRuntime>
        this.fsms = new Map();
    }

    /**
     * Agregar FSM a la entidad
     * @param {string} name - Identificador único
     * @param {FSMRuntime} fsm - La máquina de estados
     */
    add(name, fsm) {
        this.fsms.set(name, fsm);
        return this;
    }

    /**
     * Obtener FSM por nombre
     * @param {string} name
     * @returns {FSMRuntime|null}
     */
    get(name) {
        return this.fsms.get(name);
    }

    /**
     * Remover FSM
     * @param {string} name
     */
    remove(name) {
        const fsm = this.fsms.get(name);
        if (fsm && typeof fsm.destroy === 'function') {
            fsm.destroy();
        }
        this.fsms.delete(name);
    }

    /**
     * Verificar si existe FSM
     * @param {string} name
     */
    has(name) {
        return this.fsms.has(name);
    }

    /**
     * Obtener todas las FSMs
     */
    getAll() {
        return Array.from(this.fsms.values());
    }

    /**
     * Actualizar todas las FSMs
     * @param {number} delta - Tiempo en segundos
     */
    update(delta) {
        for (const fsm of this.fsms.values()) {
            fsm.update(delta);
        }
    }

    /**
     * Limpiar todas las FSMs
     */
    destroy() {
        for (const fsm of this.fsms.values()) {
            if (typeof fsm.destroy === 'function') {
                fsm.destroy();
            }
        }
        this.fsms.clear();
    }
}