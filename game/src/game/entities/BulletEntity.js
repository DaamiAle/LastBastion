import { Graphics, Sprite } from 'pixi.js';
import { Entity } from '../../engine/Entity.js';
import { distanceSq } from '../../engine/Utils.js';

export class BulletEntity extends Entity {
    constructor(scene, x, y, dirX, dirY, options = {}) {
        super(scene);

        this.type = 'bullet';
        this.speed = options.speed ?? 600;
        this.damage = options.damage ?? 25;
        this.targetTypes = options.targetTypes ?? ['zombie'];
        this.size = options.size ?? 4;
        this.color = options.color ?? 0xffff00;
        this.texture = options.texture ?? null;
        this.rotationOffset = options.rotationOffset ?? 0;
        this.maxDistance = options.maxDistance ?? 512;
        this.splashRadius = options.splashRadius ?? 0;
        this.zIndex = 5;
        this.dirX = dirX;
        this.dirY = dirY;
        this.startX = x;
        this.startY = y;
    }

    enter() {
        super.enter();

        if (this.texture) {
            this.graphics = new Sprite(this.texture);
            this.graphics.anchor.set(0.5);
            this.graphics.scale.set(this.size > 4 ? 1.5 : 1);
            this.graphics.rotation = Math.atan2(this.dirY, this.dirX) + this.rotationOffset;
        } else {
            this.graphics = new Graphics()
                .circle(0, 0, this.size)
                .fill(this.color);
        }

        this.container.addChild(this.graphics);
        this.container.x = this.startX;
        this.container.y = this.startY;
        this.container.zIndex = this.zIndex;
    }

    update(delta) {
        const dt = delta.deltaMS / 1000;

        this.container.x += this.dirX * this.speed * dt;
        this.container.y += this.dirY * this.speed * dt;

        const distSq = distanceSq(
            this.startX,
            this.startY,
            this.container.x,
            this.container.y
        );

        if (distSq > this.maxDistance * this.maxDistance) {
            this.isAlive = false;
            return;
        }

        const targets = this.scene.entities.filter((entity) => this.targetTypes.includes(entity.type));

        for (const target of targets) {
            const hitRadius = (target.radius ?? 12) + this.size;
            const hit = distanceSq(
                this.container.x,
                this.container.y,
                target.container.x,
                target.container.y
            ) < hitRadius * hitRadius;

            if (!hit) continue;

            if (this.splashRadius > 0) {
                this.applySplashDamage();
            } else {
                target.takeDamage(this.damage);
            }

            this.isAlive = false;
            return;
        }
    }

    applySplashDamage() {
        const splashRadiusSq = this.splashRadius * this.splashRadius;
        const targets = this.scene.entities.filter((entity) => this.targetTypes.includes(entity.type));

        for (const target of targets) {
            const distSq = distanceSq(
                this.container.x,
                this.container.y,
                target.container.x,
                target.container.y
            );

            if (distSq <= splashRadiusSq) {
                target.takeDamage(this.damage);
            }
        }
    }
}
