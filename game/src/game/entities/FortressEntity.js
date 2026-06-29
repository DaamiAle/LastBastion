import { Graphics, Sprite } from 'pixi.js';
import { Entity } from '../../engine/core/Entity.js';
import { assembleBullet } from '../assemblers/BulletAssembler.js';
import { Health } from '../components/Health.js';
import { Transform } from '../components/Transform.js';

export class FortressEntity extends Entity {
    constructor(scene, x, y) {
        super(scene);

        const config = scene.game.config.fortress;

        this.type = 'fortress';
        this.radius = config.radius;
        this.maxHp = config.maxHealth;
        this.hp = this.maxHp;
        this.regenRate = config.regenRate;
        this.attackRange = config.attackRange;
        this.fireRate = config.fireRateMs;
        this.fireTimer = 0;
        this.damage = config.damage;
        this.level = 1;
        this.upgradeLevels = {
            damage: 0,
            range: 0,
            cadence: 0
        };
        this.upgradeCost = config.upgradeBaseCost;
        this.canTakeDamage = true;
        this.x = x;
        this.y = y;

        this.addTag('target');
        this.addTag('static');
    }

    enter() {
        super.enter();

        this.base = new Sprite(this.scene.game.assets.bastionBaseTexture);
        this.base.anchor.set(0.5);
        this.base.width = 432;
        this.base.height = 432;

        const spriteSet = this.scene.game.assets.turretSprites.machinegun;

        this.turretBase = new Sprite(spriteSet.base[1]);
        this.turretBase.anchor.set(0.5);
        this.turretBase.width = 40;
        this.turretBase.height = 40;
        this.turretBase.scale.set(this.scene.game.config.fortress.turretVisualScale);

        this.turret = new Sprite(spriteSet.head[1]);
        this.turret.anchor.set(0.5);
        this.turret.width = 40;
        this.turret.height = 40;
        this.turret.rotation = Math.PI * 0.5;
        this.turret.scale.set(this.scene.game.config.fortress.turretVisualScale);

        this.container.addChild(this.base);
        this.container.addChild(this.turretBase);
        this.container.addChild(this.turret);

        this.container.x = this.x;
        this.container.y = this.y;
        this.container.scale.set(this.scene.game.config.fortress.scale);
        this.container.zIndex = 2;
    }

    takeDamage(amount) {
        this.hp -= amount;
        this.applyFlash(true);

        if (this.hp < 0) {
            this.hp = 0;
        }
    }

    update(delta) {
        const dt = delta.deltaMS / 1000;
        const config = this.scene.game.config.fortress;
        const projectile = config.projectile;
        const noise = config.noise;

        if (this.hp > 0) {
            this.hp = Math.min(this.maxHp, this.hp + this.regenRate * dt);
        }

        this.fireTimer -= delta.deltaMS;

        if (this.target) {
            if (typeof this.target === 'number') {
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
            } else {
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
        
        if (!this.target) {
            this.target = this.scene.findNearestEnemy(this.container.x, this.container.y, this.attackRange);
        }

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

    applyFlash(active) {
        this.base.alpha = active ? 0.45 : 1;
    }

    upgrade(stat) {
        this.upgradeLevels[stat] += 1;
        this.level = 1 + this.getTotalUpgradeCount();
        this.applyUpgradeStats();
    }

    applyUpgradeStats() {
        const config = this.scene.game.config.fortress;

        this.damage = Math.round(config.damage * (1 + this.upgradeLevels.damage * config.damageScalePerLevel));
        this.attackRange = Math.round(config.attackRange * (1 + this.upgradeLevels.range * config.rangeScalePerLevel));
        this.fireRate = Math.max(
            config.minFireRateMs,
            config.fireRateMs * (1 - this.upgradeLevels.cadence * config.cadenceScalePerLevel)
        );
    }

    getUpgradeCost(stat) {
        const config = this.scene.game.config.fortress;
        const total = this.getTotalUpgradeCount();
        const branchLevel = this.upgradeLevels[stat];
        return Math.round(config.upgradeBaseCost + (total + branchLevel + 1) * config.upgradeCostPerLevel);
    }

    getTotalUpgradeCount() {
        return this.upgradeLevels.damage + this.upgradeLevels.range + this.upgradeLevels.cadence;
    }

    getStatsSummary() {
        return `Dmg ${this.damage} | Rng ${this.attackRange} | Cad ${Math.round(this.fireRate)}ms`;
    }
}
