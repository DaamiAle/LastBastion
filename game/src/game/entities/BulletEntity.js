import { Entity } from '../../engine/Entity.js';
import { Graphics } from 'pixi.js';
import { distanceSq } from '../../engine/utils.js';

export class BulletEntity extends Entity {
    constructor(scene, x, y, dirX, dirY) {
        super(scene);

        this.speed = 600; // px/sec
        this.damage = 25;

        this.dirX = dirX;
        this.dirY = dirY;

        this.startX = x;
        this.startY = y;

        this.maxDistance = 512;
    }

    enter() {
        super.enter();

        this.graphics = new Graphics()
            .rect(0, 0, 4, 4)
            .fill(0xffff00);

        this.container.addChild(this.graphics);

        this.container.x = this.startX;
        this.container.y = this.startY;
    }

    update(delta) {
        const dt = delta.deltaMS / 1000;

        // mover
        this.container.x += this.dirX * this.speed * dt;
        this.container.y += this.dirY * this.speed * dt;

        // 🔥 rango máximo
        const distSq = distanceSq(
            this.startX, this.startY,
            this.container.x, this.container.y
        );

        if (distSq > this.maxDistance * this.maxDistance) {
            this.isAlive = false;
            return;
        }

        // 🔥 colisión con zombies
        const zombies = this.scene.entities.filter(e => e.type === "zombie");

        for (const z of zombies) {
            const zx = z.container.x;
            const zy = z.container.y;

            const hit = distanceSq(
                this.container.x, this.container.y,
                zx, zy
            ) < 16 * 16;

            if (hit) {
                z.takeDamage(this.damage);
                this.isAlive = false;
                return;
            }
        }
    }
}