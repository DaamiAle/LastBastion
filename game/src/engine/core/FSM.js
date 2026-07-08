/**
 * Finite State Machine (FSM) manager.
 * Handles state transitions and propagates update calls to the active state.
 */
export class FSM {
    /**
     * @param {Object} owner The entity or object that owns this FSM
     */
    constructor(owner) {
        /** @type {Object} The owner of the FSM context */
        this.owner = owner;
        /** @type {State|null} The currently active state */
        this.current = null;
    }

    /**
     * Changes the current state to a new state.
     * Calls exit() on the old state and enter() on the new one.
     * @param {State} state The new state to transition into
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
     * Updates the currently active state.
     * @param {Object} delta Object containing time delta information
     */
    update(delta) {
        if (this.current) {
            this.current.update(delta);
        }
    }
}