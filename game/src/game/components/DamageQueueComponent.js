import { Component } from '../../engine/ecs/Component.js';

/**
 * Acumula el daño dirigido a una entidad durante el fotograma actual.
 * Procesado por el CombatSystem.
 */
export class DamageQueueComponent extends Component {
    constructor() {
        super();
        /** @type {Array<number>} Lista de cantidades de daño entrante para este fotograma */
        this.damages = [];
    }

    /**
     * Encola un impacto de daño para ser procesado.
     * @param {number} amount Cantidad de daño a aplicar
     */
    addDamage(amount) {
        this.damages.push(amount);
    }
}
