import { Container } from 'pixi.js';
import { Scene } from '../../engine/core/Scene.js';
import { Button } from '../../ui/Button.js';
import { GameScene } from './GameScene.js';

export class MainMenuScene extends Scene {
    enter() {
        super.enter();

        this.ui = new Container();
        this.container.addChild(this.ui);

        const centerX = this.game.app.renderer.width / 2;
        const quickMode = this.game.config.presets.quickMode;

        this.addButton('Nuevo Juego', centerX, 200, () => {
            this.game.sceneManager.change(new GameScene(this.game));
        });

        this.addButton('Continuar', centerX, 300, () => {
            this.game.sceneManager.change(new GameScene(this.game, { loadSave: true }));
        });

        this.addButton('Modo Rapido', centerX, 400, () => {
            this.game.sceneManager.change(new GameScene(this.game, quickMode));
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
