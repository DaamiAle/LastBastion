import { Entity } from '../../engine/Entity.js';
import { Graphics, Sprite } from 'pixi.js';
import { distanceSq } from '../../engine/Utils.js';

export class TurretSlotEntity extends Entity {
    constructor(scene, x, y, index) {
        super(scene);

        this.type = 'turret-slot';
        this.x = x;
        this.y = y;
        this.index = index;
        this.radius = scene.game.config.slots.radius;
        this.turret = null;
    }

    enter() {
        super.enter();

        this.slotSprite = new Sprite(this.scene.game.assets.turretSlotTexture);
        this.slotSprite.anchor.set(0.5);
        this.slotSprite.width = this.radius * 2.3;
        this.slotSprite.height = this.radius * 2.3;

        this.ring = new Graphics();
        this.container.addChild(this.slotSprite);
        this.container.addChild(this.ring);

        this.container.x = this.x;
        this.container.y = this.y;
        this.container.zIndex = 1;
        this.redraw();
    }

    redraw(selected = false) {
        const stroke = selected ? 0xfbbf24 : (this.turret ? 0x22c55e : 0x64748b);
        this.slotSprite.alpha = this.turret ? 0.95 : 0.72;

        this.ring.clear()
            .circle(0, 0, this.radius)
            .stroke({ color: stroke, width: 4, alpha: 0.95 });
    }

    containsWorldPoint(x, y) {
        return distanceSq(x, y, this.container.x, this.container.y) <= this.radius * this.radius;
    }
}
