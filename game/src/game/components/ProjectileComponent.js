import { Component } from '../../engine/ecs/Component.js';

/**
 * Define las propiedades físicas y de combate para los proyectiles.
 */
export class ProjectileComponent extends Component {
    /**
     * @param {number} startX La posición inicial X donde se disparó el proyectil
     * @param {number} startY La posición inicial Y donde se disparó el proyectil
     * @param {number} damage Cuánta salud restar al objetivo al impactar
     * @param {number} maxDistance La distancia máxima de viaje antes de que el proyectil desaparezca
     * @param {number} splashRadius Si > 0, el proyectil daña un área al impactar
     * @param {number} hitRadius El radio de colisión físico del proyectil en sí
     */
    constructor(startX, startY, damage, maxDistance, splashRadius, hitRadius = 2) {
        super();
        /** @type {number} */
        this.startX = startX;
        /** @type {number} */
        this.startY = startY;
        /** @type {number} */
        this.damage = damage;
        /** @type {number} */
        this.maxDistance = maxDistance;
        /** @type {number} */
        this.splashRadius = splashRadius;
        /** @type {number} */
        this.hitRadius = hitRadius;
    }
}
