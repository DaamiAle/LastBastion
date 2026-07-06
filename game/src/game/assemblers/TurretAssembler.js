import { Container, Sprite } from 'pixi.js';
import { Transform } from '../components/Transform.js';
import { Health } from '../components/Health.js';
import { SpriteComponent } from '../components/SpriteComponent.js';
import { TurretAIComponent } from '../components/TurretAIComponent.js';
import { AimComponent } from '../components/AimComponent.js';

export function assembleTurret(scene, slot, turretType) {
    const world = scene.game.world;
    const config = scene.game.config.turrets;
    const base = config.types[turretType];
    const entityId = world.createEntity();

    world.addComponent(entityId, new Transform(slot.container.x, slot.container.y));

    const maxHealth = base.maxHealth || config.baseHealth;
    world.addComponent(entityId, new Health(maxHealth));

    const container = new Container();
    container.x = slot.container.x;
    container.y = slot.container.y;
    container.zIndex = 4;

    const spriteSet = scene.game.assets.turretSprites[turretType];
    const baseSprite = new Sprite(spriteSet.base[0]);
    baseSprite.anchor.set(0.5);
    baseSprite.width = 40;
    baseSprite.height = 40;

    const barrelSprite = new Sprite(spriteSet.head[0]);
    barrelSprite.anchor.set(0.5);
    barrelSprite.width = 40;
    barrelSprite.height = 40;
    barrelSprite.rotation = Math.PI * 0.5;

    container.addChild(baseSprite);
    container.addChild(barrelSprite);
    
    scene.container.addChild(container);

    const spriteComp = new SpriteComponent(container);
    spriteComp.baseSprite = baseSprite;
    spriteComp.barrelSprite = barrelSprite;
    spriteComp.spriteSet = spriteSet;
    world.addComponent(entityId, spriteComp);

    world.addComponent(entityId, new AimComponent(barrelSprite));

    const aiComp = new TurretAIComponent(
        turretType,
        base.fireRateMs,
        base.range,
        base.damage,
        base.noiseRadius,
        base.noiseTtlMs,
        base.noiseStrength,
        base.projectileSpeed,
        base.splashRadius,
        base.color
    );
    aiComp.cost = base.cost;
    aiComp.invested = base.cost;
    aiComp.label = base.label;
    world.addComponent(entityId, aiComp);

    return entityId;
}

function applyTurretConfig(world, config, entityId) {
    const ai = world.getComponent(entityId, TurretAIComponent);
    const health = world.getComponent(entityId, Health);
    const spriteComp = world.getComponent(entityId, SpriteComponent);
    if (!ai || !health) return;

    const base = config.types[ai.turretType];
    const totalUpgrades = ai.upgradeLevels.damage + ai.upgradeLevels.range + ai.upgradeLevels.cadence;

    ai.range = Math.round(base.range * (1 + ai.upgradeLevels.range * config.rangeScalePerLevel));
    ai.damage = Math.round(base.damage * (1 + ai.upgradeLevels.damage * config.damageScalePerLevel));
    ai.fireRate = Math.max(
        config.minFireRateMs,
        base.fireRateMs * (1 - ai.upgradeLevels.cadence * config.fireRateScalePerLevel)
    );
    ai.noiseRadius = Math.round(base.noiseRadius * (1 + totalUpgrades * config.noiseRadiusScalePerLevel));
    ai.level = 1 + totalUpgrades;

    const stage = Math.floor(totalUpgrades / 3);
    const canonSequence = [0, 0, 1, 1, 2, 2];
    const baseSequence = [0, 1, 1, 2, 2, 2];
    
    const indexC = canonSequence[Math.min(stage, 5)];
    const indexB = baseSequence[Math.min(stage, 5)];

    if (spriteComp && spriteComp.baseSprite && spriteComp.barrelSprite) {
        spriteComp.baseSprite.texture = spriteComp.spriteSet.base[indexB];
        spriteComp.barrelSprite.texture = spriteComp.spriteSet.head[indexC];
        
        // El tamaño de las torretas se mantiene fijo.
        spriteComp.baseSprite.width = 40;
        spriteComp.baseSprite.height = 40;
        spriteComp.barrelSprite.width = 40;
        spriteComp.barrelSprite.height = 40;
    }
}

export function upgradeTurret(world, config, entityId, stat) {
    const ai = world.getComponent(entityId, TurretAIComponent);
    const health = world.getComponent(entityId, Health);
    if (!ai || !health) return;

    const cost = getTurretUpgradeCost(world, config, entityId, stat);
    ai.invested += cost;
    ai.upgradeLevels[stat] += 1;
    
    health.maxHp += config.healthPerLevel;
    health.hp = health.maxHp;

    applyTurretConfig(world, config, entityId);
}

export function getTurretUpgradeCost(world, config, entityId, stat) {
    const ai = world.getComponent(entityId, TurretAIComponent);
    if (!ai) return 0;
    
    const base = config.types[ai.turretType];
    const totalUpgrades = ai.upgradeLevels.damage + ai.upgradeLevels.range + ai.upgradeLevels.cadence;
    
    return Math.round(base.cost * (config.upgradeCostBase + (totalUpgrades) * config.upgradeCostPerLevel));
}

export function getTurretSellValue(world, gameConfig, entityId) {
    const ai = world.getComponent(entityId, TurretAIComponent);
    if (!ai) return 0;
    return Math.round(ai.invested * gameConfig.economy.sellRefundRatio);
}

export function getTurretStatsSummary(world, entityId) {
    const ai = world.getComponent(entityId, TurretAIComponent);
    if (!ai) return '';
    return `Dmg ${ai.damage} | Rng ${ai.range} | Cad ${Math.round(ai.fireRate)}ms`;
}
