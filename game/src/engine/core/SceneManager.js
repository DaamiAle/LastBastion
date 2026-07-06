export class SceneManager {
    constructor(game) {
        this.game = game;

        this.current = null;
        this.next = null;
    }

    get currentScene() {
        return this.current;
    }

    change(scene) {
        this.next = scene;
    }

    update(delta) {
        // 🔥 aplicar cambio de escena en momento seguro
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