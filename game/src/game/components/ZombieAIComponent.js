import { Component } from '../../engine/ecs/Component.js';

/**
 * Almacena el estado de IA y las propiedades para una entidad Zombie.
 */
export class ZombieAIComponent extends Component {
    /**
     * @param {Object} fsm La Máquina de Estados Finitos que maneja el comportamiento del zombie
     */
    constructor(fsm) {
        super();
        /** @type {Object} La instancia de la máquina de estados */
        this.fsm = fsm;
        
        /** @type {Object|null} Referencia a la escena de juego actual */
        this.scene = null;
        
        /** @type {Object|number|null} Entidad objetivo actual (Jugador o Bastión) */
        this.target = null;
        
        /** @type {{x: number, y: number}|null} Coordenadas específicas hacia las cuales moverse (ej. desde un ruido) */
        this.targetPoint = null;
        
        /** @type {number|null} ID de la última onda de sonido que atrajo a este zombie */
        this.lastHeardNoiseId = null;
        
        /** @type {number} Distancia máxima para iniciar un ataque */
        this.attackRange = 0;
        
        /** @type {number} Tiempo base de recarga entre ataques en milisegundos */
        this.attackCooldown = 0;
        
        /** @type {number} Temporizador actual contando hasta el próximo ataque */
        this.attackTimer = 0;
        
        /** @type {number} Daño infligido por ataque */
        this.damage = 0;
        
        /** @type {number} Radio físico utilizado para la bandada (flocking)/colisiones */
        this.radius = 0;
        
        /** @type {number} Radio visual/auditivo para detectar objetivos */
        this.detectionRadius = 0;
        
        /** @type {number} Temporizador interno utilizado durante el estado de deambular (wandering) */
        this.wanderTimer = 0;
        
        /** @type {number} Ángulo actual utilizado al deambular sin rumbo */
        this.wanderAngle = 0;
    }
}
