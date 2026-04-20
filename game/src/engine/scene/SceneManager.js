export class SceneManager {
    constructor(runtime) {
        this.runtime = runtime;
        this.current = null;
    }

    async change(scene) {
        if (this.current?.onExit) {
            this.current.onExit();
        }

        this.current = scene;

        if (this.current?.onEnter) {
            await this.current.onEnter(this.runtime); // 👈 importante
        }
    }

    update(delta) {
        if (!this.current) return;
        this.current.update(delta);
    }
}