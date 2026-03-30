export class SceneManager {
    constructor(game) {
        this.game = game;
        this.current = null;
    }

    change(scene) {
        if (this.current) {
            this.current.exit();
        }

        this.current = scene;
        this.current.enter();
    }

    update(delta) {
        if (this.current) {
            this.current.update(delta);
        }
    }
}