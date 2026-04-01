import { Scene } from '../../engine/Scene.js';
import { Container } from 'pixi.js';
import { Button } from '../../ui/Button.js';
import { GameScene } from './GameScene.js';

export class MainMenuScene extends Scene {
    enter() {
        super.enter();

        this.ui = new Container();
        this.container.addChild(this.ui);

        const centerX = this.game.app.renderer.width / 2;

        this.addButton("Nuevo Juego", centerX, 200, () => {
            console.log("Nuevo Juego");
            this.game.sceneManager.change(new GameScene(this.game));
        });

        this.addButton("Cargar Juego", centerX, 300, () => {
            console.log("Cargar Juego");
        });

        this.addButton("Opciones", centerX, 400, () => {
            console.log("Opciones");
        });
    }

    addButton(text, x, y, onClick) {
        const btn = new Button({ text, onClick });

        btn.x = x;
        btn.y = y;

        this.ui.addChild(btn);
    }

    exit() {
        super.exit();
        this.ui = null;
    }
}