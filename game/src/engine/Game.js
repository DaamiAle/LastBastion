import { Application } from 'pixi.js';
import { SceneManager } from './SceneManager.js';

export class Game {
    constructor() {
        this.app = new Application();
        this.sceneManager = new SceneManager(this);
    }

    async init() {
        await this.app.init({
            width: 800,
            height: 600,
            backgroundColor: 0x000000
        });

        document.body.appendChild(this.app.canvas);

        this.app.ticker.add(this.update.bind(this));
    }

    update(delta) {
        this.sceneManager.update(delta);
    }
}