import { Component } from '../../engine/ecs/Component.js';

/**
 * Componente que rastrea los puntos de salud de una entidad.
 */
export class Health extends Component {
    /**
     * @param {number} maxHp Puntos de salud máximos e iniciales
     */
    constructor(maxHp = 100) {
        super();
        /** @type {number} La capacidad máxima de salud */
        this.maxHp = maxHp;
        
        /** @type {number} Los puntos de salud actuales */
        this.hp = maxHp;
        
        /** @type {boolean} Bandera que indica si la entidad sigue viva */
        this.isAlive = true;
    }
}
