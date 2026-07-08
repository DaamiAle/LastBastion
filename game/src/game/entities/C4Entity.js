import { Entity } from '../../engine/core/Entity.js';
import { Graphics } from 'pixi.js';
import { distanceSq } from '../../engine/utils/Utils.js';
import { Transform } from '../components/Transform.js';
import { ZombieAIComponent } from '../components/ZombieAIComponent.js';
import { Health } from '../components/Health.js';
import { DamageQueueComponent } from '../components/DamageQueueComponent.js';

/**
 * Represents a legacy/simple C4 explosive entity. 
 * Might be deprecated in favor of ExplosiveEntity.
 */
export class C4Entity extends Entity {
    /**
     * @param {Object} scene Reference to the active scene
     * @param {number} x World X coordinate
     * @param {number} y World Y coordinate
     * @param {string} mode e.g., 'timer' or remote detonated
     */
    constructor(scene, x, y, mode) {
        super(scene);
        /** @type {string} */
        this.type = "c4";

        /** @type {number} */
        this.x = x;
        /** @type {number} */
        this.y = y;

        /** @type {string} */
        this.mode = mode;
        /** @type {boolean} */
        this.isAlive = true;

        /** @type {number} */
        this.radius = 128;

        /** @type {boolean} */
        this.isTimer = mode == "timer";
        /** @type {number} */
        this.timer = this.isTimer ? 10000 : 0;
    }

    /**
     * Creates simple graphics.
     */
    enter() {
        super.enter();

        this.graphics = new Graphics()
            .circle(0, 0, 6)
            .fill(0xffaa00);

        this.container.addChild(this.graphics);

        this.container.x = this.x;
        this.container.y = this.y;
    }

    /**
     * @param {Object} delta Time delta object
     */
    update(delta) {
        if (this.isTimer) {
            this.timer -= delta.deltaMS;

            if (this.timer <= 0) {
                this.explode();
            }
        }
    }

    /**
     * Deals massive damage to zombies in radius and destroys self.
     */
    explode() {
        const radiusSq = this.radius * this.radius;
        this.renderExplode();
        
        // Use ECS to find zombies
        const world = this.scene.game.world;
        const zombies = world.getEntitiesWith(Transform, ZombieAIComponent, Health);

        for (const zId of zombies) {
            const zTransform = world.getComponent(zId, Transform);
            const d = distanceSq(
                this.container.x, this.container.y,
                zTransform.x, zTransform.y
            );

            if (d < radiusSq) {
                // Deal massive damage to kill
                let queue = world.getComponent(zId, DamageQueueComponent);
                if (!queue) {
                    queue = new DamageQueueComponent();
                    world.addComponent(zId, queue);
                }
                queue.addDamage(9999);
            }
        }

        this.isAlive = false;
    }

    /**
     * Renders a basic expanding red circle.
     */
    renderExplode() {
        const explosion = new Graphics()
            .circle(0, 0, this.radius)
            .fill(0xff0000, 0.1);

        // Position the object, not the drawing
        explosion.x = this.container.x;
        explosion.y = this.container.y;

        this.scene.game.app.stage.addChild(explosion);

        // animate and remove
        const animDuration = 500; // ms
        let elapsed = 0;

        const animate = (delta) => {
            elapsed += delta.deltaMS;

            const scale = 1 + elapsed / animDuration;

            explosion.scale.set(scale);

            if (elapsed >= animDuration) {
                this.scene.game.app.stage.removeChild(explosion);
                this.scene.game.app.ticker.remove(animate);
            }
        };

        this.scene.game.app.ticker.add(animate);

    }
}