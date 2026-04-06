import { Entity } from '../../engine/Entity.js';
import { Graphics } from 'pixi.js';

export class FortressEntity extends Entity {
    constructor(scene) {
        super(scene);

        this.type = "fortress";

        this.maxHp = 1000;
        this.hp = this.maxHp;

        this.addTag("target");
        this.addTag("static");
    }

    enter() {
        super.enter();

        this.graphics = new Graphics()
            .rect(0, 0, 120, 120)
            .fill(0x888888);

        this.container.addChild(this.graphics);

        // 🔥 POSICIÓN CENTRAL (importante)
        const width = this.scene.game.app.renderer.width;
        const height = this.scene.game.app.renderer.height;

        this.container.x = width / 2;
        this.container.y = height / 2;

        // 🔥 centrar visualmente
        this.container.pivot.set(60, 60);
    }

    takeDamage(amount) {
        this.hp -= amount;

        if (this.hp < 0) this.hp = 0;

        console.log("Fortress HP:", this.hp);
    }

    getPosition() {
        return {
            x: this.container.x,
            y: this.container.y
        };
    }
}