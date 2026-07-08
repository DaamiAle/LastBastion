/**
 * Manages game scenes, enabling safe transitions between them.
 */
export class SceneManager {
    /**
     * @param {Object} game Reference to the main Game instance
     */
    constructor(game) {
        /** @type {Object} The main game instance */
        this.game = game;

        /** @type {Scene|null} The currently active scene */
        this.current = null;
        
        /** @type {Scene|null} The pending scene to swap to on the next frame */
        this.next = null;
    }

    /**
     * Gets the currently active scene.
     * @returns {Scene|null}
     */
    get currentScene() {
        return this.current;
    }

    /**
     * Requests a scene change. The actual transition occurs safely 
     * at the start of the next update cycle.
     * @param {Scene} scene The new scene to transition to
     */
    change(scene) {
        this.next = scene;
    }

    /**
     * Updates the active scene and handles pending scene transitions.
     * @param {Object} delta Time delta object
     */
    update(delta) {
        // Apply scene changes safely before the update logic runs
        if (this.next) {
            if (this.current) {
                this.current.exit();
            }

            this.current = this.next;
            this.next = null;

            this.current.enter();
        }

        if (this.current) {
            this.current.update(delta);
        }
    }
}