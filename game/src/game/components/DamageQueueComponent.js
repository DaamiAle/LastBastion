import { Component } from '../../engine/ecs/Component.js';

/**
 * Accumulates damage intended for an entity over the current frame.
 * Processed by the CombatSystem.
 */
export class DamageQueueComponent extends Component {
    constructor() {
        super();
        /** @type {Array<number>} List of incoming damage amounts for this frame */
        this.damages = [];
    }

    /**
     * Queues a damage hit to be processed.
     * @param {number} amount Amount of damage to apply
     */
    addDamage(amount) {
        this.damages.push(amount);
    }
}
