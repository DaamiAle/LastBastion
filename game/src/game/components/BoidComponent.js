import { Component } from '../../engine/ecs/Component.js';

export class BoidComponent extends Component {
    constructor(flockRadius = 60, separationWeight = 1.5, alignmentWeight = 1.0, cohesionWeight = 1.0, seekWeight = 1.0) {
        super();
        this.flockRadius = flockRadius;
        this.separationWeight = separationWeight;
        this.alignmentWeight = alignmentWeight;
        this.cohesionWeight = cohesionWeight;
        this.seekWeight = seekWeight;
        this.targetDirectionX = 0; 
        this.targetDirectionY = 0;
    }
}
