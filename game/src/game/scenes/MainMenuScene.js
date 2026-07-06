import { Container, Graphics, Text } from 'pixi.js';
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

        this.addButton('Puntuaciones', centerX, 400, () => {
            this.showHighScores();
        });
    }

    addButton(text, x, y, onClick) {
        const btn = new Button({ text, onClick });

        btn.x = x;
        btn.y = y;

        this.ui.addChild(btn);
    }

    showHighScores() {
        if (this.hsContainer) return;

        this.hsContainer = new Container();
        this.hsContainer.zIndex = 100;

        const overlay = new Graphics().rect(0, 0, 1280, 720).fill({ color: 0x000000, alpha: 0.8 });
        overlay.eventMode = 'static';
        this.hsContainer.addChild(overlay);

        const box = new Container();
        box.x = 1280 / 2;
        box.y = 720 / 2;

        const bg = new Graphics()
            .roundRect(-350, -250, 700, 500, 16)
            .fill(0x1e293b)
            .stroke({ color: 0x475569, width: 4 });
        box.addChild(bg);

        const title = new Text({
            text: 'MEJORES PARTIDAS (TOP 10)',
            style: { fill: 0xffffff, fontSize: 28, fontWeight: 'bold' }
        });
        title.anchor.set(0.5);
        title.y = -200;
        box.addChild(title);

        const btnClose = new Button({ text: 'Cerrar', onClick: () => {
            this.hsContainer.destroy();
            this.hsContainer = null;
        }});
        btnClose.y = 200;
        box.addChild(btnClose);

        let highscores = [];
        try {
            highscores = JSON.parse(localStorage.getItem('bastion-highscores')) || [];
        } catch (e) {
            highscores = [];
        }

        if (highscores.length === 0) {
            const noData = new Text({
                text: 'Aún no hay partidas registradas.',
                style: { fill: 0x94a3b8, fontSize: 18 }
            });
            noData.anchor.set(0.5);
            box.addChild(noData);
        } else {
            let startY = -140;
            highscores.forEach((score, index) => {
                const textStr = `${index + 1}. [${score.date}] Oleada: ${score.wave} | Zombies Eliminados: ${score.zombiesKilled} | Muertes: ${score.survivorDeaths}`;
                const row = new Text({
                    text: textStr,
                    style: { fill: 0xe2e8f0, fontSize: 16 }
                });
                row.anchor.set(0.5);
                row.y = startY;
                box.addChild(row);
                startY += 30;
            });
        }

        this.hsContainer.addChild(box);
        this.container.addChild(this.hsContainer);
    }

    exit() {
        super.exit();
        this.ui = null;
    }
}
