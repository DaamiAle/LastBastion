import { Container } from 'pixi.js';

export class Scene {
    constructor(game) {
        this.game = game;

        this.container = null;
        this.entities = [];
        this.collisionSystem = null;
    }

    enter() {
        this.container = new Container();
        this.game.app.stage.addChild(this.container);
    }

    addEntity(entity) { 
        this.entities.push(entity);
        entity.enter();
    }

    update(delta) {
        for (const e of this.entities) {
            if (e.isAlive) {
                e.update(delta);
            }
        }

        if (this.collisionSystem != null) {
            this.collisionSystem.processContacts();
            this.collisionSystem.resolveCollisions();
        }
        this.cleanup();
    }

    cleanup() {
        this.entities = this.entities.filter(e => {
            if (!e.isAlive) {
                e.destroy(); // 🔥 clave
                return false;
            }
            return true;
        });
    }

    exit() {
        for (const e of this.entities) {
            e.destroy();
        }

        this.entities = [];

        if (this.container) {
            this.container.destroy({ children: true });
            this.container = null;
        }
    }
}