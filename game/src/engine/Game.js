import { SceneManager } from './core/SceneManager.js';
import { Input } from './core/Input.js';
import { SaveService } from './core/SaveService.js';
import { GAME_CONFIG } from '../game/config/gameConfig.js';
import { Time } from './core/Time.js';
import { Renderer } from './core/Renderer.js';
import { World } from './ecs/World.js';
import { AssetLoader } from './utils/AssetLoader.js';
import { RenderSystem } from '../game/systems/RenderSystem.js';
import { MovementSystem } from '../game/systems/MovementSystem.js';
import { ZombieAISystem } from '../game/systems/ZombieAISystem.js';
import { TurretAISystem } from '../game/systems/TurretAISystem.js';
import { CombatSystem } from '../game/systems/CombatSystem.js';
import { CollisionSystem } from '../game/systems/CollisionSystem.js';
import { HealthBarSystem } from '../game/systems/HealthBarSystem.js';
import { SoundManager } from './utils/SoundManager.js';

/**
 * Main Game class. Bootstraps the engine, initializes core systems (ECS, Renderer, Input),
 * and manages the main game loop.
 */
export class Game {
    /**
     * Initializes all the core managers and services before assets are loaded.
     */
    constructor() {
        /** @type {Object} Global configuration object */
        this.config = GAME_CONFIG;
        /** @type {Time} Time management and delta calculation */
        this.time = new Time();
        /** @type {Renderer} PixiJS renderer wrapper */
        this.renderer = new Renderer(this.config);
        /** @type {World} Entity-Component-System world */
        this.world = new World();
        /** @type {SceneManager} Manages game states/scenes */
        this.sceneManager = new SceneManager(this);
        /** @type {Input} Handles keyboard and mouse input */
        this.input = new Input();
        /** @type {SaveService} Handles local storage operations */
        this.save = new SaveService();
        /** @type {Object} Loaded game assets (textures, spritesheets, etc) */
        this.assets = {};
    }

    /**
     * Asynchronously loads assets, initializes sound, and prepares the ECS systems.
     * Starts the main PixiJS ticker loop.
     * @returns {Promise<void>}
     */
    async init() {
        await this.renderer.init();
        
        // Expose app for backward compatibility during migration
        this.app = this.renderer.app; 

        SoundManager.init();
        this.assets = await AssetLoader.loadAllAssets();

        // Register ECS Systems
        // AISystems require a reference to the active scene/sceneManager to query the environment
        this.world.addSystem(new ZombieAISystem(this.world));
        this.world.addSystem(new TurretAISystem(this.world, this.sceneManager));
        this.world.addSystem(new MovementSystem(this.world, this.sceneManager));
        this.world.addSystem(new CollisionSystem(this.world, this.sceneManager));
        this.world.addSystem(new CombatSystem(this.world, this.sceneManager));
        this.world.addSystem(new HealthBarSystem(this.world, this.sceneManager));
        
        // Render system must run last
        this.world.addSystem(new RenderSystem(this.world));

        // Start the main game loop
        this.renderer.app.ticker.add((ticker) => {
            this.time.update(ticker);
            // Pass delta down simulating the old PIXI ticker object
            this.update({ deltaMS: this.time.deltaTime });
        });
    }

    /**
     * Main update loop called every frame.
     * Updates the ECS world, the active scene, and clears frame-specific inputs.
     * @param {Object} delta Object containing delta time in milliseconds
     */
    update(delta) {
        // ECS update loop
        this.world.update(delta);
        
        // Update active scene logic
        this.sceneManager.update(delta);
        
        // Reset single-frame input states (e.g., keys pressed this frame)
        this.input.endFrame();
    }
}

