import { Application, Assets } from 'pixi.js';
import { SceneManager } from '../SceneManager.js';
import { Input } from '../Input.js';

export class Game {
    constructor() {
        this.app = new Application();
        this.sceneManager = new SceneManager(this);

        this.input = new Input();
    }

    async init() {
        await this.app.init({
            width: 1280,
            height: 720,
            backgroundColor: 0x000000
        });

        document.body.appendChild(this.app.canvas);

        this.app.ticker.add(this.update.bind(this));

        // Carga de assets
        await Assets.load('/assets/zombie.png'); // Textura del zombie
        await Assets.load('/assets/player.png'); // Textura del jugador
        await Assets.load('/assets/fortress.png'); // Textura de la fortaleza
    }

    update(delta) {
        this.sceneManager.update(delta);
    }
}