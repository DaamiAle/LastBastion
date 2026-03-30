import { Container } from 'pixi.js';

export class Scene {
    constructor(game) {
        this.game = game;
        this.container = null;
    }

    enter() {
        this.container = new Container();
        this.game.app.stage.addChild(this.container);
    }

    exit() {
        if (this.container) {
            this.container.destroy({ children: true });
            this.container = null;
        }
    }

    update(delta) { }
}