export class Input {
    constructor() {
        this.keys = new Set();

        window.addEventListener('keydown', (e) => {
            //console.log("keydown:", e.code); // 👈 DEBUG
            this.keys.add(e.code);
        });

        window.addEventListener('keyup', (e) => {
            //console.log("keyup:", e.code); // 👈 DEBUG
            this.keys.delete(e.code);
        });
    }

    isKeyDown(key) {
        return this.keys.has(key);
    }
}