import { Scene } from '../engine/Scene.js';
import { Graphics } from 'pixi.js';

export class GameScene extends Scene {

    constructor(game) {
        super(game);

        this.box = null;
    }
    enter() {
        super.enter();

        // Crear objeto visual
        this.box = new Graphics()
            .rect(0, 0, 100, 100)
            .fill(0xff0000);

        // Posición inicial
        this.box.x = 100;
        this.box.y = 100;

        // Agregar a la escena
        this.container.addChild(this.box);
    }

    update(delta) {
        console.log(delta.deltaTime);
        this.box.x = this.box.x + (2 * delta.deltaTime);

        if (this.box.x > 800) {
            this.box.x = -100; // reaparece desde la izquierda
        }
    }

    exit() {
        super.exit();

        // limpiar referencias (importante para GC)
        this.box = null;
    }
}