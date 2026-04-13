import { Entity } from '../../engine/Entity.js';
import { Graphics } from 'pixi.js';
import { distanceSq } from '../../engine/utils.js';
import { BulletEntity } from './BulletEntity.js';

export class PlayerEntity extends Entity {
    constructor(scene) {
        super(scene);

        this.type = "player";
        this.baseColor = 0x333333;
        this.width = 48;
        this.health = 128;
        this.maxHealth = 128;
        this.baseSpeed = 0.25;
        this.canTakeDamage = true;

        this.attackRange = 500;
        this.fireCooldown = 75; // ms
        this.fireTimer = 0;

        this.addTag("player");
        this.addTag("movable");
    }

    enter() {
        super.enter();

        this.graphics = new Graphics()
            .rect(0, 0, this.width, this.width)
            .fill(this.baseColor);

        this.container.addChild(this.graphics);

        // spawn inicial (después será la fortaleza)
        this.container.x = 400;
        this.container.y = 300;
    }

    update(delta) {
        const input = this.scene.game.input;

        const speed = this.baseSpeed * delta.deltaMS; // 🔥 FIX unidad

        let dx = 0;
        let dy = 0;

        if (input.isKeyDown("KeyW")) dy -= 1;
        if (input.isKeyDown("KeyS")) dy += 1;
        if (input.isKeyDown("KeyA")) dx -= 1;
        if (input.isKeyDown("KeyD")) dx += 1;

        if (dx !== 0 && dy !== 0) {
            const len = Math.sqrt(dx * dx + dy * dy);
            dx /= len;
            dy /= len;
        }

        this.container.x += dx * speed;
        this.container.y += dy * speed;

        this.shoot(delta);
      
        this.applyFlash(false);
    }

    regenerate(delta) {
        if (!this.canRegen) return;

        if (this.health < this.maxHealth) {
            this.health += 10 * (delta.deltaTime / 1000); // 10 HP por segundo
            if (this.health > this.maxHealth) this.health = this.maxHealth;
        }

    }

    shoot(delta) {
        this.fireTimer -= delta.deltaMS;

        const zombies = this.scene.entities.filter(e => e.type === "zombie");
        if (zombies.length === 0) return;

        // 🔥 buscar más cercano
        let closest = null;
        let minDist = Infinity;

        for (const z of zombies) {
            const d = distanceSq(
                this.container.x, this.container.y,
                z.container.x, z.container.y
            );

            if (d < minDist) {
                minDist = d;
                closest = z;
            }
        }

        if (!closest) return;

        const attackRangeSq = this.attackRange * this.attackRange;

        if (minDist > attackRangeSq) {
            return; // 🔴 fuera de rango → no dispara
        }

        // 🔥 disparar
        if (this.fireTimer <= 0) {
            this.fireTimer = this.fireCooldown;

            const dx = closest.container.x - this.container.x;
            const dy = closest.container.y - this.container.y;

            const len = Math.sqrt(dx * dx + dy * dy);
            if (len === 0) return;

            const dirX = dx / len;
            const dirY = dy / len;

            this.scene.addEntity(
                new BulletEntity(
                    this.scene,
                    this.container.x,
                    this.container.y,
                    dirX,
                    dirY
                )
            );
        }
    }

    takeDamage(amount) {
        this.health -= amount;
        
        //this.setColor(0xff0000);
        this.applyFlash(true);
        if (this.health < 0) this.health = 0;
        


    }

    applyFlash(active) {
        if (active) {
            this.graphics.alpha = 0.25; // ahora
        } else {
            this.graphics.alpha = 1;
        }
    }

    setColor(color) {
        this.graphics.clear()
            .rect(0, 0, this.width, this.width)
            .fill(color);
    }
}