import { Container } from 'pixi.js';
import { clamp, lerp } from './Utils.js';

export class Scene {
    constructor(game) {
        this.game = game;

        this.container = null;
        this.entities = [];
        this.cameraTarget = null;
        this.cameraLerp = 0.1;
        this.worldWidth = 2200;
        this.worldHeight = 1400;
    }

    enter() {
        this.container = new Container();
        this.container.sortableChildren = true;
        this.game.app.stage.addChild(this.container);
    }

    addEntity(entity) {
        this.entities.push(entity);
        entity.enter();
    }

    update(delta) {
        for (const entity of this.entities) {
            if (entity.isAlive) {
                entity.update(delta);
            }
        }

        this.entities = this.entities.filter((entity) => {
            if (!entity.isAlive) {
                entity.destroy();
                return false;
            }

            return true;
        });

        this.updateCamera();
    }

    exit() {
        for (const entity of this.entities) {
            entity.destroy();
        }

        this.entities = [];

        if (this.container) {
            this.container.destroy({ children: true });
            this.container = null;
        }
    }

    setCameraTarget(entity) {
        this.cameraTarget = entity;
    }

    setWorldSize(width, height) {
        this.worldWidth = width;
        this.worldHeight = height;
    }

    screenToWorld(screenX, screenY) {
        const rect = this.game.app.canvas.getBoundingClientRect();
        const scaleX = this.game.app.renderer.width / rect.width;
        const scaleY = this.game.app.renderer.height / rect.height;
        const x = (screenX - rect.left) * scaleX;
        const y = (screenY - rect.top) * scaleY;

        return {
            x: x - this.container.x,
            y: y - this.container.y
        };
    }

    worldToScreen(worldX, worldY) {
        return {
            x: worldX + this.container.x,
            y: worldY + this.container.y
        };
    }

    updateCamera() {
        if (!this.container || !this.cameraTarget?.container) return;

        const renderer = this.game.app.renderer;
        const desiredX = renderer.width * 0.5 - this.cameraTarget.container.x;
        const desiredY = renderer.height * 0.5 - this.cameraTarget.container.y;
        const minX = Math.min(0, renderer.width - this.worldWidth);
        const minY = Math.min(0, renderer.height - this.worldHeight);
        const clampedX = clamp(desiredX, minX, 0);
        const clampedY = clamp(desiredY, minY, 0);

        this.container.x = lerp(this.container.x, clampedX, this.cameraLerp);
        this.container.y = lerp(this.container.y, clampedY, this.cameraLerp);
    }
}
