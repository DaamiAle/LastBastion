import { Component } from '../../engine/ecs/Component.js';

/**
 * Componente de lógica de IA y estadísticas para las Torretas.
 * Rastrea la adquisición de objetivos, cadencia de tiro y estado de mejora.
 */
export class TurretAIComponent extends Component {
    /**
     * @param {string} turretType 'machinegun', 'cannon', o 'sniper'
     * @param {number} fireRate Tiempo en milisegundos entre disparos
     * @param {number} range Radio máximo de detección de objetivos
     * @param {number} damage Daño infligido por disparo
     * @param {number} noiseRadius Radio de la onda de sonido emitida al disparar
     * @param {number} noiseTtlMs Cuánto tiempo persiste la onda de sonido
     * @param {number} noiseStrength Fuerza/prioridad de la onda de sonido para la atracción de zombies
     * @param {number} projectileSpeed Velocidad en píxeles por fotograma de la bala
     * @param {number} splashRadius Radio de área de efecto para la bala (0 para impacto directo)
     * @param {number} color Código de color hexadecimal para la bala
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
        
        /** @type {Object|number|null} Entidad objetivo actual (ID de ECS o Entidad clásica) */
        this.target = null;

        // Datos de mejora
        /** @type {number} Nivel general actual de la torreta */
        this.level = 1;
        /** @type {number} Monedas totales invertidas en esta torreta */
        this.invested = 0;
        /** @type {number} Costo base de la torreta */
        this.cost = 0;
        /** @type {{damage: number, range: number, cadence: number}} Contadores de mejora por estadística */
        this.upgradeLevels = {
            damage: 0,
            range: 0,
            cadence: 0
        };
    }
}
