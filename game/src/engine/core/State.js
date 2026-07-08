/**
 * Base class for a state within a Finite State Machine (FSM).
 */
export class State {
    /**
     * @param {Object} owner The entity or object that this state operates on
     */
    constructor(owner) {
        /** @type {Object} The owner of the state */
        this.owner = owner;
    }

    /** Called when the state becomes active */
    enter() { }
    
    /**
     * Called every frame while the state is active
     * @param {Object} delta Time delta object
     */
    update(delta) { }
    
    /** Called when the state is being exited */
    exit() { }
}