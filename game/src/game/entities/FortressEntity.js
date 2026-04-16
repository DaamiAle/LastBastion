import { Entity } from '../../engine/Entity.js';
import { Assets, Sprite } from 'pixi.js';

export class FortressEntity extends Entity {
    constructor(scene) {
        super(scene);

        this.type = "fortress";

        this.maxHp = 1000;
        this.hp = this.maxHp;
        this.regenRate = 5; // HP por segundo
        this.fireRate = 600; // ms (M16 aprox)
        this.fireTimer = 0;

        this.collider = {
            type: "aabb",
            halfWidth: 224,  // ajustable
            halfHeight: 224
        };

        this.canTakeDamage = true;
        this.texture = Assets.get('/assets/fortress.png');
        this.sprite = null;

        this.addTag("target");
        this.addTag("static");
    }

    enter() {
        super.enter();

        this.sprite = new Sprite(this.texture);

        this.sprite.scale.set(0.5);
        this.sprite.anchor.set(0.5);

        this.container.addChild(this.sprite);

        // 🔥 POSICIÓN CENTRAL (importante)
        const width = this.scene.game.app.renderer.width;
        const height = this.scene.game.app.renderer.height;

        this.container.x = width / 2;
        this.container.y = height / 2;

    }

    takeDamage(amount) {
        this.hp -= amount;
        this.applyFlash(true);
        if (this.hp < 0) this.hp = 0;

    }
    update(delta) {
        this.applyFlash(false);
    }

    getPosition() {
        return {
            x: this.container.x,
            y: this.container.y
        };
    }

    applyFlash(active) {
        if (active) {
            this.sprite.alpha = 0.25// ahora
        } else {
            this.sprite.alpha = 1;
        }
    }
}