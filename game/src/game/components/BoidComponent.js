import { Component } from '../../engine/ecs/Component.js';

/**
 * Componente utilizado por el MovementSystem para aplicar el comportamiento de bandada (boids) a las entidades.
 */
export class BoidComponent extends Component {
    /**
     * @param {number} flockRadius El radio de búsqueda para encontrar boids vecinos
     * @param {number} separationWeight Cuánto intenta el boid evitar amontonarse con los vecinos
     * @param {number} alignmentWeight Cuánto intenta el boid alinearse con la dirección promedio de los vecinos
     * @param {number} cohesionWeight Cuánto intenta el boid moverse hacia la posición promedio de los vecinos
     * @param {number} seekWeight Cuánto intenta el boid moverse hacia su objetivo principal
     */
    constructor(flockRadius = 60, separationWeight = 1.5, alignmentWeight = 1.0, cohesionWeight = 1.0, seekWeight = 1.0) {
        super();
        this.flockRadius = flockRadius;
        this.separationWeight = separationWeight;
        this.alignmentWeight = alignmentWeight;
        this.cohesionWeight = cohesionWeight;
        this.seekWeight = seekWeight;
        
        /** @type {number} La dirección X del objetivo deseado, usualmente establecida por la IA */
        this.targetDirectionX = 0; 
        /** @type {number} La dirección Y del objetivo deseado, usualmente establecida por la IA */
        this.targetDirectionY = 0;
    }
}
