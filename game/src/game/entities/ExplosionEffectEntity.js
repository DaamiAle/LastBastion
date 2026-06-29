import { Sprite } from 'pixi.js';
import { Entity } from '../../engine/core/Entity.js';

export class ExplosionEffectEntity extends Entity {
    constructor(scene, x, y, radius) {
        super(scene);
        this.sprite = new Sprite(scene.game.assets.explosionTexture);
        this.sprite.anchor.set(0.5);
        
        const baseSize = Math.max(1, this.sprite.texture.width);
        this.initialScale = (radius * 2) / baseSize;
        this.sprite.scale.set(this.initialScale);
        
        this.container.addChild(this.sprite);

        this.x = x;
        this.y = y;
        this.container.x = x;
        this.container.y = y;
        this.isAlive = true;
        this.timer = 0;
        this.duration = 400; // ms
    }

    update(dt) {
        if (!this.isAlive) return;

        this.timer += dt.deltaMS;
        if (this.timer >= this.duration) {
            this.isAlive = false;
        } else {
            const progress = this.timer / this.duration;
            this.sprite.alpha = 1 - progress;
            this.sprite.scale.set(this.initialScale * (1 + progress * 0.2)); // expand up to 20%
        }
    }
}
