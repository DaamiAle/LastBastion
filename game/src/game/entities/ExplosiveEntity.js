import { Sprite } from 'pixi.js';
import { Entity } from '../../engine/core/Entity.js';
import { SoundManager } from '../../engine/utils/SoundManager.js';
import { Transform } from '../components/Transform.js';
import { Health } from '../components/Health.js';
import { DamageQueueComponent } from '../components/DamageQueueComponent.js';

/**
 * Maneja diferentes tipos de explosivos ('c4', 'landmine', 'timebomb').
 */
export class ExplosiveEntity extends Entity {
    /**
     * @param {Object} scene Referencia a la escena activa
     * @param {number} x Coordenada X mundial
     * @param {number} y Coordenada Y mundial
     * @param {string} type El tipo de explosivo ('c4', 'landmine', 'timebomb')
     */
    constructor(scene, x, y, type) {
        super(scene);
        /** @type {string} */
        this.type = type;
        /** @type {Object} */
        this.config = scene.game.config.explosives[type];
        
        this.sprite = new Sprite(scene.game.assets.explosivePlantedTexture);
        this.sprite.anchor.set(0.5);
        this.sprite.scale.set(0.26); // ~31px en el mundo para la textura de 122x122
        this.container.addChild(this.sprite);

        /** @type {number} */
        this.x = x;
        /** @type {number} */
        this.y = y;
        this.container.x = x;
        this.container.y = y;
        
        /** @type {boolean} */
        this.isAlive = true;
        /** @type {boolean} */
        this.detonated = false;

        /** @type {number} */
        this.timer = 0;
        /** @type {boolean} */
        this.beepPlayed = false;
    }

    /**
     * Un dispositivo explosivo colocado por el jugador en el suelo.
     * Maneja lógicas de temporizador o detonador y aplica daño de área al explotar.
     * @param {Object} dt Objeto de diferencia de tiempo
     */
    update(dt) {
        if (!this.isAlive || this.detonated) return;

        if (this.type === 'timebomb') {
            this.timer += dt.deltaMS;
            
            const timeRemaining = this.config.fuseMs - this.timer;
            if (timeRemaining > 0) {
                if (timeRemaining < 400) {
                    this.sprite.tint = 0xff0000; // Rojo sólido justo antes de la detonación
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

    /**
     * Dispara la explosión del dispositivo, aplicando daño a los enemigos cercanos.
     */
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
