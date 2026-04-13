import { Container } from 'pixi.js';

export class Entity {
    static nextId = 1; // 🔥 arranca en 1

    constructor(scene) {
        this.scene = scene;

        this.id = Entity.nextId++; // 🔥 1,2,3,4...

        this.type = "entity";
        this.tags = new Set();

        this.container = new Container();

        this.isAlive = true;
    }

    enter() {
        this.scene.container.addChild(this.container);
    }

    update(delta) { }

    destroy() {
        if (!this.container) return;

        if (this.container.parent) {
            this.container.parent.removeChild(this.container);
        }

        this.container.destroy({ children: true });
        this.container = null;
    }

    addTag(tag) {
        this.tags.add(tag);
    }

    hasTag(tag) {
        return this.tags.has(tag);
    }
}