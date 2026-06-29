import { Entity } from '../../engine/Entity.js';
import { Container, Sprite } from 'pixi.js';
import { BulletEntity } from './BulletEntity.js';

export class TurretEntity extends Entity {
    static getConfig(type, gameConfig) {
        return gameConfig.turrets.types[type];
    }

    constructor(scene, slot, turretType) {
        super(scene);

        const config = scene.game.config.turrets;

        this.type = 'turret';
        this.slot = slot;
        this.turretType = turretType;
        this.radius = config.baseRadius;
        this.maxHealth = config.types[turretType].maxHealth || config.baseHealth;
        this.health = this.maxHealth;
        this.canTakeDamage = true;
        this.fireTimer = 0;
        this.invested = 0;
        this.upgradeLevels = {
            damage: 0,
            range: 0,
            cadence: 0
        };
        this.level = 1;
        this.applyConfig();
    }

    applyConfig() {
        const config = this.scene.game.config.turrets;
        const base = config.types[this.turretType];
        const totalUpgrades = this.getTotalUpgradeCount();

        this.label = base.label;
        this.range = Math.round(base.range * (1 + this.upgradeLevels.range * config.rangeScalePerLevel));
        this.damage = Math.round(base.damage * (1 + this.upgradeLevels.damage * config.damageScalePerLevel));
        this.fireRate = Math.max(
            config.minFireRateMs,
            base.fireRateMs * (1 - this.upgradeLevels.cadence * config.fireRateScalePerLevel)
        );
        this.projectileSpeed = base.projectileSpeed;
        this.color = base.color;
        this.splashRadius = base.splashRadius;
        this.cost = base.cost;
        this.noiseRadius = Math.round(base.noiseRadius * (1 + totalUpgrades * config.noiseRadiusScalePerLevel));
        this.noiseTtlMs = base.noiseTtlMs;
        this.noiseStrength = base.noiseStrength;
        this.level = 1 + totalUpgrades;

        if (this.invested === 0) {
            this.invested = this.cost;
        }
    }

    enter() {
        super.enter();

        const spriteSet = this.getSpriteSet();
        const index = this.getVisualLevelIndex();

        this.base = new Sprite(spriteSet.base[index]);
        this.base.anchor.set(0.5);
        this.base.width = 40;
        this.base.height = 40;

        this.barrel = new Sprite(spriteSet.head[index]);
        this.barrel.anchor.set(0.5);
        this.barrel.width = 40;
        this.barrel.height = 40;
        this.barrel.rotation = Math.PI * 0.5;

        this.container.addChild(this.base);
        this.container.addChild(this.barrel);
        this.createHealthBar();

        this.container.x = this.slot.container.x;
        this.container.y = this.slot.container.y;
        this.container.zIndex = 3;
    }

    update(delta) {
        this.fireTimer -= delta.deltaMS;
        this.updateHealthBar();

        if (this.target && !this.target.isAlive) {
            this.target = null;
        }
        if (this.target) {
            const dx = this.target.container.x - this.container.x;
            const dy = this.target.container.y - this.container.y;
            if (dx * dx + dy * dy > this.range * this.range) {
                this.target = null;
            }
        }
        if (!this.target) {
            this.target = this.scene.findNearestEnemy(this.container.x, this.container.y, this.range);
        }

        if (!this.target) return;

        const dx = this.target.container.x - this.container.x;
        const dy = this.target.container.y - this.container.y;
        const angle = Math.atan2(dy, dx);
        const len = Math.hypot(dx, dy) || 1;

        this.barrel.rotation = angle + Math.PI * 0.5;

        if (this.fireTimer <= 0) {
            this.fireTimer = this.fireRate;
            this.scene.emitNoise(this.container.x, this.container.y, {
                radius: this.noiseRadius,
                ttl: this.noiseTtlMs,
                strength: this.noiseStrength
            });

            this.scene.addEntity(new BulletEntity(
                this.scene,
                this.container.x + Math.cos(angle) * 22,
                this.container.y + Math.sin(angle) * 22,
                dx / len,
                dy / len,
                {
                    damage: this.damage,
                    color: this.color,
                    speed: this.projectileSpeed,
                    size: this.splashRadius > 0 ? 6 : 4,
                    maxDistance: this.range + 24,
                    splashRadius: this.splashRadius,
                    texture: this.scene.game.assets[this.turretType + 'BulletTexture'],
                    rotationOffset: Math.PI / 2
                }
            ));
        }
    }

    takeDamage(amount) {
        this.health -= amount;
        this.base.alpha = 0.55;
        this.updateHealthBar();

        if (this.health <= 0) {
            this.slot.turret = null;
            this.isAlive = false;
        }
    }

    upgrade(stat) {
        const config = this.scene.game.config.turrets;
        const cost = this.getUpgradeCost(stat);

        this.invested += cost;
        this.upgradeLevels[stat] += 1;
        this.maxHealth += config.healthPerLevel;
        this.health = this.maxHealth;
        this.applyConfig();
        this.updateVisualLevel();
        this.base.scale.set(1 + this.getTotalUpgradeCount() * config.scalePerLevel);
        this.updateHealthBar();
    }

    getUpgradeCost(stat) {
        const config = this.scene.game.config.turrets;
        const base = config.types[this.turretType];
        const totalUpgrades = this.getTotalUpgradeCount();
        const branchLevel = this.upgradeLevels[stat];
        return Math.round(base.cost * (config.upgradeCostBase + (totalUpgrades + branchLevel + 1) * config.upgradeCostPerLevel));
    }

    getTotalUpgradeCount() {
        return this.upgradeLevels.damage + this.upgradeLevels.range + this.upgradeLevels.cadence;
    }

    getSellValue() {
        return Math.round(this.invested * this.scene.game.config.economy.sellRefundRatio);
    }

    getStatsSummary() {
        return `Dmg ${this.damage} | Rng ${this.range} | Cad ${Math.round(this.fireRate)}ms`;
    }

    getSpriteSet() {
        return this.scene.game.assets.turretSprites[this.turretType];
    }

    getVisualLevelIndex() {
        return Math.min(2, this.level - 1);
    }

    updateVisualLevel() {
        const spriteSet = this.getSpriteSet();
        const index = this.getVisualLevelIndex();

        this.base.texture = spriteSet.base[index];
        this.barrel.texture = spriteSet.head[index];
    }

    createHealthBar() {
        const bgTexture = this.scene.game.assets.healthBarBgTexture;
        const fillTexture = this.scene.game.assets.healthBarFillTexture;

        this.healthBarContainer = new Container();
        this.healthBarContainer.y = -30;
        this.healthBarContainer.visible = false;

        this.healthBarBg = new Sprite(bgTexture);
        this.healthBarBg.anchor.set(0.5);
        this.healthBarBg.width = 34;
        this.healthBarBg.height = 8;

        this.healthBarFill = new Sprite(fillTexture);
        this.healthBarFill.anchor.set(0, 0.5);
        this.healthBarFill.x = -15;
        this.healthBarFillFullWidth = 30;
        this.healthBarFill.width = this.healthBarFillFullWidth;
        this.healthBarFill.height = 4;

        this.healthBarContainer.addChild(this.healthBarBg);
        this.healthBarContainer.addChild(this.healthBarFill);
        this.container.addChild(this.healthBarContainer);
    }

    updateHealthBar() {
        if (!this.healthBarContainer) return;

        const ratio = Math.max(0, Math.min(1, this.health / this.maxHealth));
        this.healthBarFill.width = this.healthBarFillFullWidth * ratio;
        this.healthBarContainer.visible = ratio < 1 && ratio > 0;
    }
}
