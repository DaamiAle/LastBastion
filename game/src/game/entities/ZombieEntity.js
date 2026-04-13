import { Entity } from '../../engine/Entity.js';
import { Graphics } from 'pixi.js';
import { FSM } from '../../engine/FSM.js';
import { IdleState } from '../states/IdleState.js';

export class ZombieEntity extends Entity {
    constructor(scene) {
        super(scene);

        this.type = "zombie";
        this.baseColor = 0x00ff00;
        this.width = 24;
        this.speed = 60;
        this.detectionRadius = 200;
        this.attackRange = 20;
        this.attackCooldown = 2000; // ms
        this.damage = 1;
        this.maxHp = 100;
        this.hp = this.maxHp;
        this.isAlive = true;
        this.hitTimer = 0;
        this.canTakeDamage = true;
        this.fsm = new FSM(this);

        this.target = null;
    }

    enter() {
        super.enter();

        this.graphics = new Graphics()
            .rect(0, 0, this.width, this.width)
            .fill(this.baseColor);

        this.container.addChild(this.graphics);

        // spawn random (solo para test)
        this.container.x = Math.random() * 1920 * 2;
        this.container.y = Math.random() * 1080 * 2;

        this.fsm.change(new IdleState(this));
    }

    update(delta) {
        this.fsm.update(delta);

        //this.setColor(this.baseColor);
        this.applyFlash(false);
    }

    getPosition() {
        return {
            x: this.container.x,
            y: this.container.y
        };
    }
    takeDamage(amount) {
        this.hp -= amount;

        //this.setColor(0xff0000);
        this.applyFlash(true);

        if (this.hp <= 0) {
            this.die();
        }
    }
    die() {
        this.isAlive = false;
    }
    setColor(color) {
        this.graphics.clear()
            .rect(0, 0, this.width, this.width)
            .fill(color);
    }

    applyFlash(active) {
        if (active) {
            this.graphics.alpha = 0.25; // ahora
        } else {
            this.graphics.alpha = 1;
        }
    }
}