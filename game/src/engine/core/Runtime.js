/**
 * Runtime
 * 
 * Punto de entrada principal del engine.
 * Maneja inicialización y loop principal.
 */

import { Application } from 'pixi.js';
import { Time } from './Time.js';
import { Config } from './Config.js';
import { Scheduler } from './Scheduler.js';
import { StateMachineSystem } from '../system/StateMachineSystem.js';
import { SceneManager } from '../scene/SceneManager.js';
import { AudioService } from '../services/AudioService.js';
import { InputService } from '../services/InputService.js';
import { SaveService } from '../services/SaveService.js';
import { AssetLoader } from '../services/AssetLoader.js';
import { PixiRenderBackend } from '../render/PixiRenderBackend.js';
import { PluginManager } from '../plugins/PluginManager.js';

// Sistemas del engine (para que GameBase pueda usarlos sin imports circulares)
import { InputSystem } from '../system/InputSystem.js';
import { AccelerationSystem } from '../system/AccelerationSystem.js';
import { MovementSystem } from '../system/MovementSystem.js';
import { CollisionSystem } from '../system/CollisionSystem.js';
import { AnimationStateSystem } from '../system/AnimationStateSystem.js';
import { AnimationSystem } from '../system/AnimationSystem.js';
import { RenderSystem } from '../system/RenderSystem.js';


export class Runtime {
    constructor(configOptions = {}) {
        this.config = new Config(configOptions);

        this.app = new Application();
        this.time = new Time();
        this.scheduler = new Scheduler();

        // Backend de renderizado (será inicializado en init())
        this.renderBackend = null;

        // 👇 servicios
        this.audio = new AudioService();
        this.input = new InputService();
        this.save = new SaveService();
        this.assets = new AssetLoader();

        this.sceneManager = new SceneManager(this);
        this.stateMachineSystem = new StateMachineSystem();

        // Registry de sistemas disponibles (para que GameBase los use)
        this.systemRegistry = {
            InputSystem,
            AccelerationSystem,
            MovementSystem,
            CollisionSystem,
            AnimationStateSystem,
            AnimationSystem,
            RenderSystem
        };

        // Plugin manager
        this.plugins = new PluginManager(this);

        // Configuración del juego (GameConfig o GameBase)
        this.gameConfig = null;
    }

    async init() {
        await this.app.init({
            width: this.config.width,
            height: this.config.height,
            backgroundColor: this.config.backgroundColor
        });

        document.body.appendChild(this.app.canvas);

        // Crear backend de renderizado (PixiJS)
        this.renderBackend = new PixiRenderBackend(this.app);

        this.app.ticker.add((ticker) => this._update(ticker));
    }

    _update(ticker) {
        this.time.update(ticker.deltaMS);

        // Si deltaTime es 0 (pausa), evitar actualizar ciertos servicios
        if (this.time.deltaTime > 0) {
            this.input.update();
            this.scheduler.update(this.time);
        }

        this.sceneManager.update(this.time);

        this.stateMachineSystem.update(this.time);
    }
}