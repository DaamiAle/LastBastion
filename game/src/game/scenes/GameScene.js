import { Scene } from '../../engine/Scene.js';
import { PlayerEntity } from '../entities/PlayerEntity.js';
import { FortressEntity } from '../entities/FortressEntity.js';
import { ZombieEntity } from '../entities/ZombieEntity.js';
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


        this.fortress = new FortressEntity(this);
        this.addEntity(this.fortress);

        this.player = new PlayerEntity(this);
        this.addEntity(this.player);


        for (let i = 0; i < 1024; i++) {
            this.addEntity(new ZombieEntity(this));
        }
    }

    update(delta) {
        super.update(delta);
        const hudData = {
            fortressHp: this.fortress.hp,
            playerHp: this.player.health,
            zombies: this.entities.filter(e => e.type === "zombie").length
        };
        this.hud.update(hudData);
    }

    exit() {
        super.exit();
        if (this.hud) {
            this.hud.container.destroy({ children: true });
            this.hud = null;
        }
    }
}