import { Container, Graphics, Sprite } from 'pixi.js';
import { Entity } from '../../engine/Entity.js';
import { FSM } from '../../engine/FSM.js';
import { IdleState } from '../states/IdleState.js';

export class ZombieEntity extends Entity {
    constructor(scene, x, y) {
        super(scene);

        const config = scene.game.config.zombies;

        this.type = 'zombie';
        this.radius = config.radius;
        this.speed = config.minSpeed + Math.random() * (config.maxSpeed - config.minSpeed);
        this.detectionRadius = config.detectionRadius;
        this.attackRange = config.attackRange;
        this.attackCooldown = config.attackCooldownMs;
        this.damage = config.damage;
        this.maxHp = config.maxHealth;
        this.hp = this.maxHp;
        this.canTakeDamage = true;
        this.target = null;
        this.targetPoint = null;
        this.lastHeardNoiseId = null;
        this.fsm = new FSM(this);
        this.flockRadius = config.flockRadius;
        this.separationWeight = config.separationWeight;
        this.alignmentWeight = config.alignmentWeight;
        this.cohesionWeight = config.cohesionWeight;
        this.seekWeight = config.seekWeight;
        this.wanderAngle = Math.random() * Math.PI * 2;
        this.wanderTimer = 0;
        this.velocityX = Math.cos(this.wanderAngle);
        this.velocityY = Math.sin(this.wanderAngle);
        this.x = x;
        this.y = y;
    }

    enter() {
        super.enter();

        const texture = this.scene.game.assets.zombieTexture;
        if (texture) {
            this.sprite = new Sprite(texture);
            this.sprite.anchor.set(0.5);
            this.sprite.scale.set(this.scene.game.config.zombies.spriteScale);
            this.container.addChild(this.sprite);
        } else {
            this.graphics = new Graphics()
                .circle(0, 0, this.radius)
                .fill(0x9ae6b4)
                .stroke({ color: 0x14532d, width: 2 });
            this.container.addChild(this.graphics);
        }

        this.createHealthBar();

        this.container.x = this.x;
        this.container.y = this.y;
        this.container.zIndex = 2;
        this.fsm.change(new IdleState(this));
    }

    update(delta) {
        this.fsm.update(delta);
        if (this.sprite) {
            const angle = Math.atan2(this.velocityY, this.velocityX);
            this.sprite.rotation = angle + this.scene.game.config.zombies.aimRotationOffset;
        }
        this.updateHealthBar();
        this.applyFlash(false);
    }

    takeDamage(amount) {
        this.hp -= amount;
        this.applyFlash(true);

        if (this.hp <= 0) {
            this.die();
        }
    }

    die() {
        this.isAlive = false;
        this.scene.onZombieKilled(this);
    }

    applyFlash(active) {
        if (this.sprite) {
            this.sprite.alpha = active ? 0.45 : 1;
        }
        if (this.graphics) {
            this.graphics.alpha = active ? 0.3 : 1;
        }
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

        const ratio = Math.max(0, Math.min(1, this.hp / this.maxHp));
        this.healthBarFill.width = this.healthBarFillFullWidth * ratio;
        this.healthBarContainer.visible = ratio < 1 && ratio > 0;
    }
}
