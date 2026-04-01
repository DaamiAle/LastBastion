import { Scene } from '../../engine/Scene.js';
import { PlayerEntity } from '../entities/PlayerEntity.js';
import { HUD } from '../../ui/HUD.js';

export class GameScene extends Scene {

    constructor(game) {
        super(game);

        this.hud = null;
    }
    enter() {
        super.enter();

        this.hud = new HUD(this.game);

        // 🔥 importante: UI va directo al stage, NO al container
        this.game.app.stage.addChild(this.hud.container);

        this.addEntity(new PlayerEntity(this));
    }

    update(delta) {
        super.update(delta);
        this.hud.update(delta);
    }

    exit() {
        super.exit();
        if (this.hud) {
            this.hud.container.destroy({ children: true });
            this.hud = null;
        }
    }
}