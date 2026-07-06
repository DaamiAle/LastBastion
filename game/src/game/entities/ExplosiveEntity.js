import { Sprite } from 'pixi.js';
import { Entity } from '../../engine/core/Entity.js';
import { SoundManager } from '../../engine/utils/SoundManager.js';
import { Transform } from '../components/Transform.js';
import { Health } from '../components/Health.js';
import { DamageQueueComponent } from '../components/DamageQueueComponent.js';

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
        this.beepPlayed = false;
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
                
                if (!this.beepPlayed) {
                    SoundManager.play('timebomb_beep');
                    this.beepPlayed = true;
                }
            }

            if (this.timer >= this.config.fuseMs) {
                this.sprite.tint = 0xffffff;
                this.detonate();
            }
        } else if (this.type === 'landmine') {
            for (const zombie of this.scene.getEnemies()) {
                let zx, zy;
                if (typeof zombie === 'number') {
                    const transform = this.scene.game.world.getComponent(zombie, Transform);
                    if (!transform) continue;
                    zx = transform.x;
                    zy = transform.y;
                } else {
                    if (!zombie.isAlive) continue;
                    zx = zombie.container.x;
                    zy = zombie.container.y;
                }
                
                const dx = zx - this.container.x;
                const dy = zy - this.container.y;
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
            let zx, zy;
            if (typeof zombie === 'number') {
                const transform = this.scene.game.world.getComponent(zombie, Transform);
                if (!transform) continue;
                zx = transform.x;
                zy = transform.y;
            } else {
                if (!zombie.isAlive) continue;
                zx = zombie.container.x;
                zy = zombie.container.y;
            }

            const dx = zx - this.container.x;
            const dy = zy - this.container.y;
            const distSq = dx * dx + dy * dy;
            
            if (distSq <= radiusSq) {
                if (typeof zombie === 'number') {
                    let damageQueue = this.scene.game.world.getComponent(zombie, DamageQueueComponent);
                    if (!damageQueue) {
                        damageQueue = new DamageQueueComponent();
                        this.scene.game.world.addComponent(zombie, damageQueue);
                    }
                    console.log("EXPLOSIVE addDamage to zombie:", zombie, "amount:", this.config.damage);
                    damageQueue.addDamage(this.config.damage);
                } else {
                    if (zombie.takeDamage) {
                        zombie.takeDamage(this.config.damage);
                    } else {
                        zombie.hp -= this.config.damage;
                    }
                }
            }
        }

        if (this.type === 'c4') {
            this.scene.c4Ready = false;
        }

        SoundManager.play('explosive_explode');

        this.scene.spawnExplosion(this.container.x, this.container.y, this.config.radius);
    }
}
