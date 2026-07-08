import { Container, Sprite } from 'pixi.js';
import { Transform } from '../components/Transform.js';
import { Health } from '../components/Health.js';
import { SpriteComponent } from '../components/SpriteComponent.js';
import { TurretAIComponent } from '../components/TurretAIComponent.js';
import { AimComponent } from '../components/AimComponent.js';

/**
 * Crea y registra una nueva entidad de torreta en el ECS en un espacio (slot) especificado.
 * @param {Object} scene La escena activa del juego
 * @param {Object} slot La entidad TurretSlotEntity donde construir
 * @param {string} turretType 'machinegun', 'cannon', o 'sniper'
 * @returns {number} El ID de la entidad ECS recién creada
 */
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

/**
 * Re-evalúa y aplica mejoras estadísticas y visuales a una torreta en base a su nivel actual.
 * @param {Object} world Instancia del ECS World
 * @param {Object} config Objeto de configuración de torretas
 * @param {number} entityId ID de entidad ECS de la torreta
 */
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

/**
 * Incrementa el nivel de mejora de una torreta para una estadística específica y aplica los cambios.
 * @param {Object} world Instancia del ECS World
 * @param {Object} config Objeto de configuración de torretas
 * @param {number} entityId ID de entidad ECS de la torreta
 * @param {string} stat 'damage', 'range', o 'cadence'
 */
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

/**
 * Calcula el costo actual para la siguiente mejora de una estadística específica.
 * @param {Object} world Instancia del ECS World
 * @param {Object} config Objeto de configuración de torretas
 * @param {number} entityId ID de entidad ECS de la torreta
 * @param {string} stat La estadística a mejorar
 * @returns {number} Costo en monedas
 */
export function getTurretUpgradeCost(world, config, entityId, stat) {
    const ai = world.getComponent(entityId, TurretAIComponent);
    if (!ai) return 0;
    
    const base = config.types[ai.turretType];
    const totalUpgrades = ai.upgradeLevels.damage + ai.upgradeLevels.range + ai.upgradeLevels.cadence;
    
    return Math.round(base.cost * config.upgradeCostBase * Math.pow(1 + config.upgradeCostPerLevel, totalUpgrades));
}

/**
 * Calcula el valor total de reembolso al vender una torreta.
 * @param {Object} world Instancia del ECS World
 * @param {Object} gameConfig Objeto de configuración global del juego
 * @param {number} entityId ID de entidad ECS de la torreta
 * @returns {number} Valor de reembolso en monedas
 */
export function getTurretSellValue(world, gameConfig, entityId) {
    const ai = world.getComponent(entityId, TurretAIComponent);
    if (!ai) return 0;
    return Math.round(ai.invested * gameConfig.economy.sellRefundRatio);
}

/**
 * Genera un resumen formateado de las estadísticas de combate actuales de la torreta.
 * @param {Object} world Instancia del ECS World
 * @param {number} entityId ID de entidad ECS de la torreta
 * @returns {string} Ej. "Dmg 25 | Rng 300 | Cad 600ms"
 */
export function getTurretStatsSummary(world, entityId) {
    const ai = world.getComponent(entityId, TurretAIComponent);
    if (!ai) return '';
    return `Dmg ${ai.damage} | Rng ${ai.range} | Cad ${Math.round(ai.fireRate)}ms`;
}
