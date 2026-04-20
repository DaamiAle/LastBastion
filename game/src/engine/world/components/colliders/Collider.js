// engine/world/components/colliders/Collider.js

export class Collider {
    constructor(type, options = {}) {
        this.type = type;
        this.layer = options.layer || 'default';
    }
}