import { Container } from 'pixi.js';

export class Scene {
    constructor(game) {
        this.game = game;

        this.container = null;
        this.entities = []; 
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

        // limpiar muertos
        this.entities = this.entities.filter(e => e.isAlive);
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