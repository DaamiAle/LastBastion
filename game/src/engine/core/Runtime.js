// engine/core/Runtime.js

import { Application } from 'pixi.js';
import { Time } from './Time.js';
import { Config } from './Config.js';
import { Scheduler } from './Scheduler.js';
import { SceneManager } from '../scene/SceneManager.js';

export class Runtime {
    constructor(configOptions = {}) {
        this.config = new Config(configOptions);

        this.app = new Application();
        this.time = new Time();
        this.scheduler = new Scheduler();

        // 👇 clave
        this.sceneManager = new SceneManager(this);
    }

    async init() {
        await this.app.init({
            width: this.config.width,
            height: this.config.height,
            backgroundColor: this.config.backgroundColor
        });

        document.body.appendChild(this.app.canvas);

        this.app.ticker.add((ticker) => this._update(ticker));
    }

    _update(ticker) {
        // 1) tiempo
        this.time.update(ticker.deltaMS);
        const deltaTime = this.time.deltaTime;

        // 2) scheduler
        this.scheduler.update(deltaTime);

        // 3) escena activa
        this.sceneManager.update(deltaTime);
    }
}