import { Component } from '../../engine/ecs/Component.js';

/**
 * Component used by the MovementSystem to apply flocking (boids) behavior to entities.
 */
export class BoidComponent extends Component {
    /**
     * @param {number} flockRadius The search radius to find neighboring boids
     * @param {number} separationWeight How strongly the boid tries to avoid crowding neighbors
     * @param {number} alignmentWeight How strongly the boid steers towards the average heading of neighbors
     * @param {number} cohesionWeight How strongly the boid steers towards the average position of neighbors
     * @param {number} seekWeight How strongly the boid moves towards its main target
     */
    constructor(flockRadius = 60, separationWeight = 1.5, alignmentWeight = 1.0, cohesionWeight = 1.0, seekWeight = 1.0) {
        super();
        this.flockRadius = flockRadius;
        this.separationWeight = separationWeight;
        this.alignmentWeight = alignmentWeight;
        this.cohesionWeight = cohesionWeight;
        this.seekWeight = seekWeight;
        
        /** @type {number} The desired target X direction, usually set by AI */
        this.targetDirectionX = 0; 
        /** @type {number} The desired target Y direction, usually set by AI */
        this.targetDirectionY = 0;
    }
}
