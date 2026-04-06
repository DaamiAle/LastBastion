import { Entity } from '../../engine/Entity.js';
import { Graphics } from 'pixi.js';
import { FSM } from '../../engine/FSM.js';
import { IdleState } from '../states/IdleState.js';

export class ZombieEntity extends Entity {
    constructor(scene) {
        super(scene);

        this.type = "zombie";

        this.speed = 60;
        this.detectionRadius = 200;

        this.fsm = new FSM(this);

        this.target = null;
    }

    enter() {
        super.enter();

        this.graphics = new Graphics()
            .rect(0, 0, 30, 30)
            .fill(0x00ffff);

        this.container.addChild(this.graphics);

        // spawn random (solo para test)
        this.container.x = Math.random() * 800;
        this.container.y = Math.random() * 600;

        this.fsm.change(new IdleState(this));
    }

    update(delta) {
        this.fsm.update(delta);
    }

    getPosition() {
        return {
            x: this.container.x,
            y: this.container.y
        };
    }
}