import { Component } from '../../engine/ecs/Component.js';

/**
 * AI logic and stats component for Turrets.
 * Tracks target acquisition, firing rate, and upgrade state.
 */
export class TurretAIComponent extends Component {
    /**
     * @param {string} turretType 'machinegun', 'cannon', or 'sniper'
     * @param {number} fireRate Time in milliseconds between shots
     * @param {number} range Maximum target detection radius
     * @param {number} damage Damage dealt per shot
     * @param {number} noiseRadius Radius of the sound wave emitted upon firing
     * @param {number} noiseTtlMs How long the sound wave persists
     * @param {number} noiseStrength Strength/priority of the sound wave for zombie attraction
     * @param {number} projectileSpeed Pixels per frame velocity of the bullet
     * @param {number} splashRadius Area of effect radius for the bullet (0 for direct hit)
     * @param {number} color Hex color code for the bullet
     */
    constructor(turretType, fireRate, range, damage, noiseRadius, noiseTtlMs, noiseStrength, projectileSpeed, splashRadius, color) {
        super();
        /** @type {string} */
        this.turretType = turretType;
        /** @type {number} */
        this.fireRate = fireRate;
        /** @type {number} */
        this.fireTimer = fireRate;
        /** @type {number} */
        this.range = range;
        /** @type {number} */
        this.damage = damage;
        /** @type {number} */
        this.noiseRadius = noiseRadius;
        /** @type {number} */
        this.noiseTtlMs = noiseTtlMs;
        /** @type {number} */
        this.noiseStrength = noiseStrength;
        /** @type {number} */
        this.projectileSpeed = projectileSpeed;
        /** @type {number} */
        this.splashRadius = splashRadius;
        /** @type {number} */
        this.color = color;
        
        /** @type {Object|number|null} Current target entity (ECS ID or classic Entity) */
        this.target = null;

        // Upgrade data
        /** @type {number} Current overall turret level */
        this.level = 1;
        /** @type {number} Total coins invested in this turret */
        this.invested = 0;
        /** @type {number} Base cost of the turret */
        this.cost = 0;
        /** @type {{damage: number, range: number, cadence: number}} Upgrade counters per stat */
        this.upgradeLevels = {
            damage: 0,
            range: 0,
            cadence: 0
        };
    }
}
