// src/engine/scene/SceneManager.js
export class SceneManager {
    constructor(runtime) {
        this.runtime = runtime;
        this.current = null;
    }

    async change(scene) {
        if (!scene) {
            console.error('SceneManager.change: invalid scene provided');
            return;
        }

        if (this.current?.onExit) {
            this.current.onExit();
        }

        // limpiar scheduler al salir de escena
        if (this.runtime && this.runtime.scheduler && typeof this.runtime.scheduler.clear === 'function') {
            this.runtime.scheduler.clear();
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