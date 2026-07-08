import { Component } from '../../engine/ecs/Component.js';

/**
 * Stores AI state and properties for a Zombie entity.
 */
export class ZombieAIComponent extends Component {
    /**
     * @param {Object} fsm The Finite State Machine managing the zombie's behavior
     */
    constructor(fsm) {
        super();
        /** @type {Object} The state machine instance */
        this.fsm = fsm;
        
        /** @type {Object|null} Reference to the current game scene */
        this.scene = null;
        
        /** @type {Object|number|null} Current target entity (Player or Bastion) */
        this.target = null;
        
        /** @type {{x: number, y: number}|null} Specific coordinates to move towards (e.g. from noise) */
        this.targetPoint = null;
        
        /** @type {number|null} ID of the last sound wave that attracted this zombie */
        this.lastHeardNoiseId = null;
        
        /** @type {number} Max distance to initiate an attack */
        this.attackRange = 0;
        
        /** @type {number} Base cooldown between attacks in milliseconds */
        this.attackCooldown = 0;
        
        /** @type {number} Current timer counting down to next attack */
        this.attackTimer = 0;
        
        /** @type {number} Damage dealt per attack */
        this.damage = 0;
        
        /** @type {number} Physical radius used for flocking/collisions */
        this.radius = 0;
        
        /** @type {number} Visual/Auditory radius to detect targets */
        this.detectionRadius = 0;
        
        /** @type {number} Internal timer used during wandering state */
        this.wanderTimer = 0;
        
        /** @type {number} Current angle used when wandering aimlessly */
        this.wanderAngle = 0;
    }
}
