import { Sprite } from 'pixi.js';
import { Entity } from '../../engine/Entity.js';

export class ExplosiveEntity extends Entity {
    constructor(scene, x, y, type) {
        super(scene);
        this.type = type;
        this.config = scene.game.config.explosives[type];
        
        this.sprite = new Sprite(scene.game.assets.explosivePlantedTexture);
        this.sprite.anchor.set(0.5);
        this.sprite.scale.set(0.26); // ~31px in world for the 122x122 texture
        this.container.addChild(this.sprite);

        this.x = x;
        this.y = y;
        this.container.x = x;
        this.container.y = y;
        
        this.isAlive = true;
        this.detonated = false;

        this.timer = 0;
    }

    update(dt) {
        if (!this.isAlive || this.detonated) return;

        if (this.type === 'timebomb') {
            this.timer += dt.deltaMS;
            
            const timeRemaining = this.config.fuseMs - this.timer;
            if (timeRemaining > 0) {
                if (timeRemaining < 400) {
                    this.sprite.tint = 0xff0000; // Solid red just before detonation
                } else {
                    const blinkRate = Math.max(100, (timeRemaining / this.config.fuseMs) * 500);
                    const isBlink = Math.floor(this.timer / blinkRate) % 2 === 0;
                    this.sprite.tint = isBlink ? 0xff0000 : 0xffffff;
                }
            }

            if (this.timer >= this.config.fuseMs) {
                this.sprite.tint = 0xffffff;
                this.detonate();
            }
        } else if (this.type === 'landmine') {
            for (const zombie of this.scene.getEnemies()) {
                if (!zombie.isAlive) continue;
                const dx = zombie.container.x - this.container.x;
                const dy = zombie.container.y - this.container.y;
                const distSq = dx * dx + dy * dy;
                const triggerSq = this.config.triggerRadius * this.config.triggerRadius;
                if (distSq <= triggerSq) {
                    this.detonate();
                    break;
                }
            }
        }
    }

    detonate() {
        if (this.detonated) return;
        this.detonated = true;
        this.isAlive = false;

        const radiusSq = this.config.radius * this.config.radius;
        for (const zombie of this.scene.getEnemies()) {
            if (!zombie.isAlive) continue;
            const dx = zombie.container.x - this.container.x;
            const dy = zombie.container.y - this.container.y;
            const distSq = dx * dx + dy * dy;
            if (distSq <= radiusSq) {
                if (zombie.takeDamage) {
                    zombie.takeDamage(zombie.maxHp);
                } else {
                    zombie.hp = 0;
                }
            }
        }

        if (this.scene.spawnExplosion) {
            this.scene.spawnExplosion(this.x, this.y, this.config.radius);
        }
    }
}
