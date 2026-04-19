import { Application } from 'pixi.js';
//import { Input } from '../input/Input.js';
import { Time } from './Time.js';
import { Config } from './Config.js';
import { Scheduler } from './Scheduler.js';


import { MovementSystem } from '../system/MovementSystem.js';
import { RenderSystem } from '../system/RenderSystem.js';
import { Entity } from '../world/Entity.js';
import { Transform } from '../world/components/Transform.js';
import { Velocity } from '../world/components/Velocity.js';
import { Sprite } from '../world/components/Sprite.js';
import { Assets } from 'pixi.js';

export class Runtime {
    constructor(configOptions = {}) {
        this.config = new Config(configOptions);

        this.app = new Application();
        this.time = new Time();
        //this.input = new Input();
        this.scheduler = new Scheduler();

        // 👇 NUEVO
        this.entities = [];
        this.movementSystem = new MovementSystem();
        this.renderSystem = null; // se crea en init
    }

    async init() {
        await this.app.init({
            width: this.config.width,
            height: this.config.height,
            backgroundColor: this.config.backgroundColor
        });

        document.body.appendChild(this.app.canvas);


        // 👇 cargar textura (usá una que ya tengas en /assets)
        const texture = await Assets.load('/assets/player.png');

        // 👇 crear systems
        this.renderSystem = new RenderSystem(this.app.stage);

        // 👇 crear entidad de prueba
        const e = new Entity()
            .add(new Transform())
            .add(new Velocity(100, 0)) // se mueve en X
            .add(new Sprite(texture));

        this.entities.push(e);

        this.app.ticker.add((ticker) => this._update(ticker));
    }

    _update(ticker) {
        // 1) tiempo (game time)
        this.time.update(ticker.deltaMS);
        const deltaTime = this.time.deltaTime;

        // 2) input
        //this.input.update();

        // 3) scheduler (timers globales)
        this.scheduler.update(deltaTime);


        // 👇 systems
        this.movementSystem.update(this.entities, deltaTime);
        this.renderSystem.update(this.entities);

    }
}