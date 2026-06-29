export class Input {
    constructor() {
        this.keys = new Set();
        this.pressedKeys = new Set();
        this.releasedKeys = new Set();
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

    isKeyDown(key) {
        return this.keys.has(key);
    }

    wasKeyPressed(key) {
        return this.pressedKeys.has(key);
    }

    wasMousePressed() {
        return this.mouse.leftPressed;
    }

    endFrame() {
        this.pressedKeys.clear();
        this.releasedKeys.clear();
        this.mouse.leftPressed = false;
        this.mouse.leftReleased = false;
    }
}
