/**
 * Global input manager.
 * Tracks keyboard and mouse state across the application lifecycle.
 */
export class Input {
    /**
     * Initializes input state structures and binds DOM event listeners.
     */
    constructor() {
        /** @type {Set<string>} Keys currently held down */
        this.keys = new Set();
        /** @type {Set<string>} Keys pressed during the current frame */
        this.pressedKeys = new Set();
        /** @type {Set<string>} Keys released during the current frame */
        this.releasedKeys = new Set();
        
        /** 
         * Mouse state structure
         * @type {{x: number, y: number, leftDown: boolean, leftPressed: boolean, leftReleased: boolean}}
         */
        this.mouse = {
            x: 0,
            y: 0,
            leftDown: false,
            leftPressed: false,
            leftReleased: false
        };

        window.addEventListener('keydown', (e) => {
            if (!this.keys.has(e.code)) {
                this.pressedKeys.add(e.code);
            }

            this.keys.add(e.code);
        });

        window.addEventListener('keyup', (e) => {
            this.keys.delete(e.code);
            this.releasedKeys.add(e.code);
        });

        window.addEventListener('mousemove', (e) => {
            this.mouse.x = e.clientX;
            this.mouse.y = e.clientY;
        });

        window.addEventListener('mousedown', (e) => {
            if (e.button !== 0) return;

            this.mouse.leftDown = true;
            this.mouse.leftPressed = true;
            this.mouse.x = e.clientX;
            this.mouse.y = e.clientY;
        });

        window.addEventListener('mouseup', (e) => {
            if (e.button !== 0) return;

            this.mouse.leftDown = false;
            this.mouse.leftReleased = true;
            this.mouse.x = e.clientX;
            this.mouse.y = e.clientY;
        });
    }

    /**
     * Checks if a key is currently held down.
     * @param {string} key The key code (e.g., "Space", "KeyW")
     * @returns {boolean} True if the key is down
     */
    isKeyDown(key) {
        return this.keys.has(key);
    }

    /**
     * Checks if a key was pressed precisely in the current frame.
     * @param {string} key The key code
     * @returns {boolean} True if the key was just pressed
     */
    wasKeyPressed(key) {
        return this.pressedKeys.has(key);
    }

    /**
     * Checks if the left mouse button was pressed in the current frame.
     * @returns {boolean} True if left mouse button was just pressed
     */
    wasMousePressed() {
        return this.mouse.leftPressed;
    }

    /**
     * Clears frame-specific input states.
     * Must be called at the very end of the game loop update step.
     */
    endFrame() {
        this.pressedKeys.clear();
        this.releasedKeys.clear();
        this.mouse.leftPressed = false;
        this.mouse.leftReleased = false;
    }
}
