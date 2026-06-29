import { Component } from '../../engine/ecs/Component.js';

export class TurretAIComponent extends Component {
    constructor(turretType, fireRate, range, damage, noiseRadius, noiseTtlMs, noiseStrength, projectileSpeed, splashRadius, color) {
        super();
        this.turretType = turretType;
        this.fireRate = fireRate;
        this.fireTimer = fireRate;
        this.range = range;
        this.damage = damage;
        this.noiseRadius = noiseRadius;
        this.noiseTtlMs = noiseTtlMs;
        this.noiseStrength = noiseStrength;
        this.projectileSpeed = projectileSpeed;
        this.splashRadius = splashRadius;
        this.color = color;
        this.target = null;

        // Upgrade data
        this.level = 1;
        this.invested = 0;
        this.cost = 0;
        this.upgradeLevels = {
            damage: 0,
            range: 0,
            cadence: 0
        };
    }
}
