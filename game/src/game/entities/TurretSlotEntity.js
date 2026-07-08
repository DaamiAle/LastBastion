import { Entity } from '../../engine/core/Entity.js';
import { Graphics, Sprite } from 'pixi.js';
import { distanceSq } from '../../engine/utils/Utils.js';

/**
 * Representa un espacio físico (slot) donde se puede construir una torreta.
 */
export class TurretSlotEntity extends Entity {
    /**
     * @param {Object} scene Referencia a la escena activa
     * @param {number} x Coordenada X mundial
     * @param {number} y Coordenada Y mundial
     * @param {number} index Índice único que representa este espacio
     */
    constructor(scene, x, y, index) {
        super(scene);

        /** @type {string} */
        this.type = 'turret-slot';
        /** @type {number} */
        this.x = x;
        /** @type {number} */
        this.y = y;
        /** @type {number} */
        this.index = index;
        /** @type {number} */
        this.radius = scene.game.config.slots.radius;
        
        /** @type {number|null} ID of the turret entity currently occupying this slot (ECS ID) */
        this.turret = null;
    }

    /**
     * Inicializa los gráficos del espacio y los agrega al contenedor.
     */
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

    /**
     * Actualiza la representación visual del espacio según su estado de selección y ocupación.
     * @param {boolean} selected Verdadero si el espacio está actualmente seleccionado por el jugador
     */
    redraw(selected = false) {
        const stroke = selected ? 0xfbbf24 : (this.turret ? 0x22c55e : 0x64748b);
        this.slotSprite.alpha = this.turret ? 0.95 : 0.72;

        this.ring.clear()
            .circle(0, 0, this.radius)
            .stroke({ color: stroke, width: 4, alpha: 0.95 });
    }

    /**
     * Comprueba si una coordenada mundial dada cae dentro del radio de este espacio.
     * @param {number} x Coordenada X mundial
     * @param {number} y Coordenada Y mundial
     * @returns {boolean} Verdadero si el punto está dentro del espacio
     */
    containsWorldPoint(x, y) {
        return distanceSq(x, y, this.container.x, this.container.y) <= this.radius * this.radius;
    }
}
