import { Container } from 'pixi.js';
import { clamp, lerp } from '../utils/Utils.js';

/**
 * Base class for all game scenes. 
 * Manages the display container, classic entities, and camera movement.
 */
export class Scene {
    /**
     * @param {Object} game Reference to the main Game instance
     */
    constructor(game) {
        /** @type {Object} The main game instance */
        this.game = game;

        /** @type {Container|null} The main PixiJS container for this scene */
        this.container = null;
        
        /** @type {Array<Object>} List of classic entities managed by this scene */
        this.entities = [];
        
        /** @type {Object|null} The entity the camera is currently following */
        this.cameraTarget = null;
        
        /** @type {number} The interpolation factor for camera movement (0-1) */
        this.cameraLerp = 0.1;
        
        /** @type {number} The total width of the scene's world boundaries */
        this.worldWidth = 2200;
        
        /** @type {number} The total height of the scene's world boundaries */
        this.worldHeight = 1400;
    }

    /**
     * Called when the scene becomes active.
     * Initializes the container and adds it to the stage.
     */
    enter() {
        this.container = new Container();
        this.container.sortableChildren = true;
        this.game.app.stage.addChild(this.container);
    }

    /**
     * Registers a classic entity to the scene and calls its enter method.
     * @param {Object} entity The entity to add
     */
    addEntity(entity) {
        this.entities.push(entity);
        entity.enter();
    }

    /**
     * Updates all active entities and the camera.
     * Cleans up dead entities.
     * @param {Object} delta Time delta object
     */
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

    /**
     * Called when the scene is being replaced.
     * Destroys all entities and cleans up the container.
     */
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

    /**
     * Sets the entity that the camera should follow.
     * @param {Object} entity Target entity to follow
     */
    setCameraTarget(entity) {
        this.cameraTarget = entity;
    }

    /**
     * Updates the logical boundaries of the scene world.
     * @param {number} width 
     * @param {number} height 
     */
    setWorldSize(width, height) {
        this.worldWidth = width;
        this.worldHeight = height;
    }

    /**
     * Converts DOM screen coordinates to world/scene coordinates.
     * @param {number} screenX 
     * @param {number} screenY 
     * @returns {{x: number, y: number}} The coordinates in world space
     */
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

    /**
     * Converts world/scene coordinates to DOM screen coordinates.
     * @param {number} worldX 
     * @param {number} worldY 
     * @returns {{x: number, y: number}} The coordinates in screen space
     */
    worldToScreen(worldX, worldY) {
        return {
            x: worldX + this.container.x,
            y: worldY + this.container.y
        };
    }

    /**
     * Moves the scene container to keep the camera target centered,
     * applying lerp smoothing and clamping within world bounds.
     */
    updateCamera() {
        if (!this.container || !this.cameraTarget?.container) return;

        const renderer = this.game.app.renderer;
        const desiredX = renderer.width * 0.5 - this.cameraTarget.container.x;
        const desiredY = renderer.height * 0.5 - this.cameraTarget.container.y;
        
        // Prevent camera from showing outside world bounds
        const minX = Math.min(0, renderer.width - this.worldWidth);
        const minY = Math.min(0, renderer.height - this.worldHeight);
        
        const clampedX = clamp(desiredX, minX, 0);
        const clampedY = clamp(desiredY, minY, 0);

        this.container.x = lerp(this.container.x, clampedX, this.cameraLerp);
        this.container.y = lerp(this.container.y, clampedY, this.cameraLerp);
    }
}
