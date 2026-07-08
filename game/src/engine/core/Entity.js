import { Container } from 'pixi.js';

/**
 * Base class for classic object-oriented entities (legacy/hybrid system).
 * Each entity manages its own PixiJS container, lifecycle, and tags.
 */
export class Entity {
    /** @type {number} Static counter to assign unique IDs starting from 1 */
    static nextId = 1;

    /**
     * @param {Object} scene Reference to the scene this entity belongs to
     */
    constructor(scene) {
        /** @type {Object} The scene context */
        this.scene = scene;

        /** @type {number} Unique identifier for the entity */
        this.id = Entity.nextId++;

        /** @type {string} Identifier type for the entity */
        this.type = "entity";
        
        /** @type {Set<string>} Collection of tags for easy querying */
        this.tags = new Set();

        /** @type {Container} PixiJS display container */
        this.container = new Container();

        /** @type {boolean} Flag indicating if the entity is currently active */
        this.isAlive = true;
    }

    /**
     * Called when the entity is added to the scene.
     * Attaches its container to the scene's main container.
     */
    enter() {
        this.scene.container.addChild(this.container);
    }

    /**
     * Called every frame to update the entity logic.
     * @param {Object} delta Object containing time delta information
     */
    update(delta) { }

    /**
     * Destroys the entity, removing its container from the display list
     * and freeing up associated PixiJS resources.
     */
    destroy() {
        if (!this.container) return;

        if (this.container.parent) {
            this.container.parent.removeChild(this.container);
        }

        this.container.destroy({ children: true });
        this.container = null;
    }

    /**
     * Adds a categorization tag to the entity.
     * @param {string} tag The tag to add
     */
    addTag(tag) {
        this.tags.add(tag);
    }

    /**
     * Checks if the entity has a specific tag.
     * @param {string} tag The tag to check
     * @returns {boolean} True if the entity has the tag, false otherwise
     */
    hasTag(tag) {
        return this.tags.has(tag);
    }
}