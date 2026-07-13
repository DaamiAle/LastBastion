import { AnimatedSprite, Graphics } from 'pixi.js';
import { Entity } from '../../engine/core/Entity.js';
import { clamp } from '../../engine/utils/Utils.js';
import { assembleBullet } from '../assemblers/BulletAssembler.js';
import { SoundManager } from '../../engine/utils/SoundManager.js';

/**
 * Representa a la entidad del personaje jugable.
 * Maneja el input del jugador para movimiento, disparos, restricciones de colisión y salud.
 */
export class PlayerEntity extends Entity {
    /**
     * @param {Object} scene Referencia a la escena activa
     * @param {number} x Coordenada inicial X mundial
     * @param {number} y Coordenada inicial Y mundial
     */
    constructor(scene, x, y) {
        super(scene);

        const config = scene.game.config.player;

        /** @type {string} */
        this.type = 'player';
        /** @type {number} */
        this.radius = config.radius;
        /** @type {number} */
        this.health = config.maxHealth;
        /** @type {number} */
        this.maxHealth = config.maxHealth;
        /** @type {number} Velocidad de movimiento base */
        this.baseSpeed = config.speed;
        /** @type {number} Rango dentro del cual el jugador puede construir torretas */
        this.buildRange = config.buildRange;
        /** @type {number} Distancia máxima de disparo */
        this.attackRange = config.attackRange;
        /** @type {number} Tiempo entre disparos consecutivos */
        this.fireCooldown = config.fireCooldownMs;
        /** @type {number} Temporizador para aplicar el tiempo de recarga del disparo */
        this.fireTimer = 0;
        /** @type {boolean} Indicador de si el jugador está muerto (reapareciendo) */
        this.isDead = false;
        /** @type {boolean} Indica si el jugador puede recibir daño */
        this.canTakeDamage = true;
        
        /** @type {number} Velocidad actual X */
        this.vx = 0;
        /** @type {number} Velocidad actual Y */
        this.vy = 0;
        /** @type {number} Coordenada X mundial */
        this.x = x;
        /** @type {number} Coordenada Y mundial */
        this.y = y;
    }

    /**
     * Inicializa los sprites visuales del jugador (animaciones y sombra).
     */
    enter() {
        super.enter();

        const walkFrames = this.scene.game.assets.playerWalkFrames;
        const config = this.scene.game.config.player;

        if (walkFrames?.length) {
            this.sprite = new AnimatedSprite(walkFrames);
            this.sprite.anchor.set(0.5, 0.85);
            this.sprite.scale.set(config.spriteScale);
            this.sprite.animationSpeed = config.animationSpeed;
            this.sprite.play();
            this.container.addChild(this.sprite);
        } else {
            this.sprite = new Graphics()
                .circle(0, 0, this.radius)
                .fill(0xe2e8f0);
            this.container.addChild(this.sprite);
        }

        this.shadow = new Graphics()
            .ellipse(0, 12, 16, 8)
            .fill({ color: 0x000000, alpha: 0.25 });
        this.container.addChildAt(this.shadow, 0);

        this.container.x = this.x;
        this.container.y = this.y;
        this.container.scale.set(1, 1);
        this.container.zIndex = 5;
    }

    /**
     * Procesa los inputs del jugador, aplica físicas, verifica límites y dispara.
     * @param {Object} delta Objeto de diferencia de tiempo
     */
    update(delta) {
        if (this.isDead) {
            this.health += (this.maxHealth / 30000) * delta.deltaMS;
            if (this.health >= this.maxHealth) {
                this.health = this.maxHealth;
                this.isDead = false;
                this.container.alpha = 1;
            }
        }

        const input = this.scene.game.input;
        const dt = delta.deltaMS / 1000;
        const config = this.scene.game.config.player;
        this.fireTimer -= delta.deltaMS;

        let dx = 0;
        let dy = 0;

        if (input.isKeyDown('KeyW')) dy -= 1;
        if (input.isKeyDown('KeyS')) dy += 1;
        if (input.isKeyDown('KeyA')) dx -= 1;
        if (input.isKeyDown('KeyD')) dx += 1;

        const moving = dx !== 0 || dy !== 0;
        if (moving) {
            const len = Math.hypot(dx, dy) || 1;
            dx /= len;
            dy /= len;
        }

        const targetVx = dx * this.baseSpeed;
        const targetVy = dy * this.baseSpeed;
        const currentAccelFactor = moving ? (config.acceleration ?? 10) : (config.deceleration ?? 15);

        this.vx += (targetVx - this.vx) * currentAccelFactor * dt;
        this.vy += (targetVy - this.vy) * currentAccelFactor * dt;

        this.container.x += this.vx * dt;
        this.container.y += this.vy * dt;

        this.container.x = clamp(this.container.x, config.collisionPadding, this.scene.worldWidth - config.collisionPadding);
        this.container.y = clamp(this.container.y, config.collisionPadding, this.scene.worldHeight - config.collisionPadding);

        const aimPoint = this.scene.getCursorWorldPoint();
        const shouldShoot = input.mouse.leftDown
            && !this.scene.getSlotAtWorldPoint(aimPoint.x, aimPoint.y)
            && !this.scene.isPointerOnMetaUI()
            && !this.isDead;
        if (shouldShoot) {
            this.shootAt(aimPoint);
        }

        if (this.sprite instanceof AnimatedSprite) {
            const currentSpeed = Math.hypot(this.vx, this.vy);
            const isPhysicallyMoving = currentSpeed > 10; // Umbral mínimo para considerar que se mueve

            this.sprite.animationSpeed = isPhysicallyMoving ? config.animationSpeed : 0;

            if (!isPhysicallyMoving) {
                this.sprite.gotoAndStop(0);
            } else if (!this.sprite.playing) {
                this.sprite.play();
            }

            let faceDx = 0;
            let faceDy = 0;
            
            if (input.mouse.leftDown) {
                faceDx = aimPoint.x - this.container.x;
                faceDy = aimPoint.y - this.container.y;
            } else if (isPhysicallyMoving) {
                faceDx = this.vx;
                faceDy = this.vy;
            }

            if (faceDx !== 0 || faceDy !== 0) {
                this.sprite.rotation = Math.atan2(faceDy, faceDx) + config.aimRotationOffset;
            }
        }
    }

    /**
     * Dispara un proyectil hacia las coordenadas objetivo.
     * @param {{x: number, y: number}} targetPoint Las coordenadas a las que disparar
     */
    shootAt(targetPoint) {
        if (this.fireTimer > 0) return;

        const config = this.scene.game.config.player;
        const projectile = config.projectile;
        const noise = config.noise;
        const dx = targetPoint.x - this.container.x;
        const dy = targetPoint.y - this.container.y;
        const len = Math.hypot(dx, dy);

        if (len < 1) return;
        if (len > this.attackRange) return;

        this.fireTimer = this.fireCooldown;
        this.scene.emitNoise(this.container.x, this.container.y, {
            radius: noise.radius,
            ttl: noise.ttlMs,
            strength: noise.strength
        });
        
        SoundManager.play('survivor_shoot');

        assembleBullet(
            this.scene,
            this.container.x + (dx / len) * 20,
            this.container.y + (dy / len) * 20,
            dx / len,
            dy / len,
            {
                damage: projectile.damage,
                speed: projectile.speed,
                color: projectile.color,
                size: projectile.size,
                texture: this.scene.game.assets.machinegunBulletTexture,
                rotationOffset: Math.PI / 2,
                maxDistance: this.attackRange + projectile.maxDistanceOffset
            }
        );
    }

    /**
     * Resta salud al jugador.
     * @param {number} amount Cantidad de daño recibido
     */
    takeDamage(amount) {
        if (this.isDead) return;
        
        this.health -= amount;

        if (this.health <= 0) {
            this.health = 0;
            this.isDead = true;
            this.container.alpha = 0.4;
            if (this.scene && this.scene.onPlayerDied) {
                this.scene.onPlayerDied();
            }
        }
    }
}
