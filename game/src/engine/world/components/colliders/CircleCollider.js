// src/engine/world/components/colliders/CircleCollider.js

import { Collider } from './Collider.js';

export class CircleCollider extends Collider {
    constructor(radius, options = {}) {
        super('circle', options);
        this.radius = radius;
    }
}