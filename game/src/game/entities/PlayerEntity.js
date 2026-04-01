import { Entity } from '../../engine/Entity.js';
import { Graphics } from 'pixi.js';

export class PlayerEntity extends Entity {
    constructor(scene) {
        super(scene);

        this.type = "player";
        this.health = 128;
        this.maxHealth = 128;
        this.speed = 200;

        this.addTag("player");
        this.addTag("movable");
    }

    enter() {
        super.enter();

        this.graphics = new Graphics()
            .rect(0, 0, 40, 40)
            .fill(0x00ff00);

        this.container.addChild(this.graphics);

        // spawn inicial (después será la fortaleza)
        this.container.x = 400;
        this.container.y = 300;
    }

    update(delta) {
        const input = this.scene.game.input;
        const speed = this.speed * (delta.deltaTime / 60);

        let dx = 0;
        let dy = 0;

        if (input.isKeyDown("KeyW")) dy -= 1;
        if (input.isKeyDown("KeyS")) dy += 1;
        if (input.isKeyDown("KeyA")) dx -= 1;
        if (input.isKeyDown("KeyD")) dx += 1;

        // normalizar diagonal (importante)
        if (dx !== 0 && dy !== 0) {
            const len = Math.sqrt(dx * dx + dy * dy);
            dx /= len;
            dy /= len;
        }

        this.container.x += dx * speed;
        this.container.y += dy * speed;
    }
}