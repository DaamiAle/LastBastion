// src/engine/world/components/colliders/BoxCollider.js

import { Collider } from './Collider.js';

export class BoxCollider extends Collider {
    constructor(width, height, options = {}) {
        super('box', options);
        this.width = width;
        this.height = height;
    }
}