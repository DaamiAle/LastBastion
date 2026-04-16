import { Entity } from '../../engine/Entity.js';
import { Sprite, Texture, Assets } from 'pixi.js';
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
        this.texture = Assets.get('/assets/zombie.png');
        this.sprite = null;

        this.collider.radius = 32 * 0.8;
        this.target = null;
    }

    enter() {
        super.enter();

        //this.graphics = new Graphics()
        //    .rect(0, 0, this.width, this.width)
        //    .fill(this.baseColor);
        //this.texture = Texture.from('/assets/zombie.png');
        this.sprite = new Sprite(this.texture);
        this.sprite.anchor.set(0.5);


        this.container.addChild(this.sprite);

        // spawn random (solo para test)
        this.container.x = Math.random() * 1920 * 2;
        this.container.y = Math.random() * 1080 * 2;

        this.fsm.change(new IdleState(this));
    }


    update(delta) {
        this.fsm.update(delta);

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

        this.applyFlash(true);

        if (this.hp <= 0) {
            this.die();
        }
    }
    die() {
        this.isAlive = false;
    }

    applyFlash(active) {
        if (active) {
            this.sprite.alpha = 0.25; // ahora
        } else {
            this.sprite.alpha = 1;
        }
    }
}