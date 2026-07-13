import { Graphics, Sprite } from 'pixi.js';
import { Entity } from '../../engine/core/Entity.js';
import { assembleBullet } from '../assemblers/BulletAssembler.js';
import { Health } from '../components/Health.js';
import { Transform } from '../components/Transform.js';
import { SoundManager } from '../../engine/utils/SoundManager.js';

/**
 * Representa la base central principal que el jugador debe proteger.
 * Se comporta de manera similar a una torreta pero es una entidad clásica en lugar de una del ECS.
 */
export class FortressEntity extends Entity {
    /**
     * @param {Object} scene Referencia a la escena activa
     * @param {number} x Coordenada X mundial
     * @param {number} y Coordenada Y mundial
     */
    constructor(scene, x, y) {
        super(scene);

        const config = scene.game.config.fortress;

        /** @type {string} */
        this.type = 'fortress';
        /** @type {number} */
        this.radius = config.radius;
        /** @type {number} */
        this.maxHp = config.maxHealth;
        /** @type {number} */
        this.hp = this.maxHp;
        /** @type {number} */
        this.regenRate = config.regenRate;
        /** @type {number} */
        this.attackRange = config.attackRange;
        /** @type {number} */
        this.fireRate = config.fireRateMs;
        /** @type {number} */
        this.fireTimer = 0;
        /** @type {number} */
        this.damage = config.damage;
        /** @type {number} */
        this.level = 1;
        /** @type {{damage: number, range: number, cadence: number}} */
        this.upgradeLevels = {
            damage: 0,
            range: 0,
            cadence: 0
        };
        /** @type {number} */
        this.upgradeCost = config.upgradeBaseCost;
        /** @type {boolean} */
        this.canTakeDamage = true;
        /** @type {number} */
        this.x = x;
        /** @type {number} */
        this.y = y;

        this.addTag('target');
        this.addTag('static');
    }

    /**
     * Inicializa la representación visual de la fortaleza (base y cabeza de torreta).
     */
    enter() {
        super.enter();

        this.base = new Sprite(this.scene.game.assets.bastionBaseTexture);
        this.base.anchor.set(0.5);
        this.base.width = 432;
        this.base.height = 432;

        const spriteSet = this.scene.game.assets.turretSprites.machinegun;

        const config = this.scene.game.config.fortress;

        this.turretBase = new Sprite(spriteSet.base[1]);
        this.turretBase.anchor.set(0.5);
        this.turretBase.scale.set(config.turretVisualScale);

        this.turret = new Sprite(spriteSet.head[1]);
        this.turret.anchor.set(0.5);
        this.turret.scale.set(config.turretVisualScale);
        this.turret.rotation = Math.PI * 0.5;

        this.container.addChild(this.base);
        this.container.addChild(this.turretBase);
        this.container.addChild(this.turret);

        this.container.x = this.x;
        this.container.y = this.y;
        this.container.scale.set(this.scene.game.config.fortress.scale);
        this.container.zIndex = 4;
    }

    /**
     * Aplica daño a la fortaleza.
     * @param {number} amount Cantidad de daño recibido
     */
    takeDamage(amount) {
        this.hp -= amount;
        this.applyFlash(true);

        if (this.hp < 0) {
            this.hp = 0;
        }
    }

    /**
     * Autorregenera salud y maneja el objetivo de la IA y los disparos para su torreta integrada.
     * @param {Object} delta Objeto de diferencia de tiempo
     */
    update(delta) {
        const dt = delta.deltaMS / 1000;
        const config = this.scene.game.config.fortress;
        const projectile = config.projectile;
        const noise = config.noise;

        if (this.hp > 0) {
            this.hp = Math.min(this.maxHp, this.hp + this.regenRate * dt);
        }

        this.fireTimer -= delta.deltaMS;

        // Verificar si el objetivo existente sigue siendo válido
        if (this.target) {
            if (typeof this.target === 'number') { // Entidad ECS
                const targetHealth = this.scene.game.world.getComponent(this.target, Health);
                const targetTransform = this.scene.game.world.getComponent(this.target, Transform);
                if (!targetHealth || !targetHealth.isAlive || !targetTransform) {
                    this.target = null;
                } else {
                    const dx = targetTransform.x - this.container.x;
                    const dy = targetTransform.y - this.container.y;
                    if (dx * dx + dy * dy > this.attackRange * this.attackRange) {
                        this.target = null;
                    }
                }
            } else { // Entidad clásica
                if (!this.target.isAlive) {
                    this.target = null;
                } else {
                    const dx = this.target.container.x - this.container.x;
                    const dy = this.target.container.y - this.container.y;
                    if (dx * dx + dy * dy > this.attackRange * this.attackRange) {
                        this.target = null;
                    }
                }
            }
        }
        
        // Buscar un nuevo objetivo si es necesario
        if (!this.target) {
            this.target = this.scene.findNearestEnemy(this.container.x, this.container.y, this.attackRange);
        }

        // Apuntar y disparar
        if (this.target) {
            let targetX, targetY;
            if (typeof this.target === 'number') {
                const targetTransform = this.scene.game.world.getComponent(this.target, Transform);
                targetX = targetTransform.x;
                targetY = targetTransform.y;
            } else {
                targetX = this.target.container.x;
                targetY = this.target.container.y;
            }

            const dx = targetX - this.container.x;
            const dy = targetY - this.container.y;
            const angle = Math.atan2(dy, dx);
            const len = Math.hypot(dx, dy) || 1;

            this.turret.rotation = angle + Math.PI * 0.5;

            if (this.fireTimer <= 0) {
                this.fireTimer = this.fireRate;
                this.scene.emitNoise(this.container.x, this.container.y, {
                    radius: noise.radius,
                    ttl: noise.ttlMs,
                    strength: noise.strength
                });
                
                SoundManager.play('machinegun_shot');

                assembleBullet(
                    this.scene,
                    this.container.x + Math.cos(angle) * 46,
                    this.container.y + Math.sin(angle) * 46,
                    dx / len,
                    dy / len,
                    {
                        damage: this.damage,
                        color: projectile.color,
                        speed: projectile.speed,
                        size: projectile.size,
                        maxDistance: this.attackRange + projectile.maxDistanceOffset,
                        texture: this.scene.game.assets.machinegunBulletTexture,
                        rotationOffset: Math.PI / 2
                    }
                );
            }
        }

        this.applyFlash(false);
    }

    /**
     * Dispara un destello visual al ser golpeada.
     * @param {boolean} active 
     */
    applyFlash(active) {
        this.base.alpha = active ? 0.45 : 1;
    }

    /**
     * Mejora una estadística específica de la fortaleza.
     * @param {string} stat 'damage', 'range', o 'cadence'
     */
    upgrade(stat) {
        this.upgradeLevels[stat] += 1;
        this.level = 1 + this.getTotalUpgradeCount();
        this.applyUpgradeStats();
    }

    /**
     * Recalcula las estadísticas basándose en los niveles de mejora.
     */
    applyUpgradeStats() {
        const config = this.scene.game.config.fortress;

        this.damage = Math.round(config.damage * (1 + this.upgradeLevels.damage * config.damageScalePerLevel));
        this.attackRange = Math.round(config.attackRange * (1 + this.upgradeLevels.range * config.rangeScalePerLevel));
        this.fireRate = Math.max(
            config.minFireRateMs,
            config.fireRateMs * (1 - this.upgradeLevels.cadence * config.cadenceScalePerLevel)
        );
    }

    /**
     * Calcula el costo actual de la siguiente mejora.
     * @param {string} stat 
     * @returns {number} Costo en monedas
     */
    getUpgradeCost(stat) {
        const config = this.scene.game.config.fortress;
        const total = this.getTotalUpgradeCount();
        return Math.round(config.upgradeBaseCost * Math.pow(1 + config.upgradeCostPerLevel, total));
    }

    /**
     * Devuelve el número total de mejoras aplicadas.
     * @returns {number}
     */
    getTotalUpgradeCount() {
        return this.upgradeLevels.damage + this.upgradeLevels.range + this.upgradeLevels.cadence;
    }

    /**
     * Obtiene una cadena de resumen formateada de las estadísticas de la fortaleza.
     * @returns {string}
     */
    getStatsSummary() {
        return `Dmg ${this.damage} | Rng ${this.attackRange} | Cad ${Math.round(this.fireRate)}ms`;
    }
}
