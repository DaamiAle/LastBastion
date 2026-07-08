import { Sprite } from 'pixi.js';
import { Entity } from '../../engine/core/Entity.js';

/**
 * Un efecto visual que muestra una breve explosión en una ubicación.
 */
export class ExplosionEffectEntity extends Entity {
    /**
     * @param {Object} scene Referencia a la escena activa
     * @param {number} x Coordenada X mundial de la explosión
     * @param {number} y Coordenada Y mundial de la explosión
     * @param {number} radius El radio (tamaño) del efecto de explosión
     */
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
        this.container.zIndex = 10;
        this.isAlive = true;
        
        /** @type {number} Tiempo transcurrido desde la aparición */
        this.timer = 0;
        /** @type {number} Duración total del efecto en ms */
        this.duration = 400; // ms
    }

    /**
     * Anima el desvanecimiento y la escala de la explosión con el tiempo.
     * @param {Object} dt Objeto de delta de tiempo
     */
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
