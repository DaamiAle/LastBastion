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

export class Game {
    constructor() {
        this.config = GAME_CONFIG;
        this.time = new Time();
        this.renderer = new Renderer(this.config);
        this.world = new World();
        this.sceneManager = new SceneManager(this);
        this.input = new Input();
        this.save = new SaveService();
        this.assets = {};
    }

    async init() {
        await this.renderer.init();
        this.app = this.renderer.app; // For backward compatibility during migration

        this.assets = await AssetLoader.loadAllAssets();

        // The AISystems require a reference to the active scene to spawn bullets and find targets.
        // We will pass the current scene reference dynamically or through a Game state later,
        // but for now we pass a null scene or a dummy that gets updated when scenes load.
        // TurretAISystem needs 'this.sceneManager.currentScene'. We'll just pass 'this' and let it access 'sceneManager.currentScene'
        // Let's modify TurretAISystem instantiation slightly:
        
        this.world.addSystem(new ZombieAISystem(this.world));
        this.world.addSystem(new TurretAISystem(this.world, this.sceneManager));
        
        this.world.addSystem(new MovementSystem(this.world, this.sceneManager));
        this.world.addSystem(new CollisionSystem(this.world, this.sceneManager));
        this.world.addSystem(new CombatSystem(this.world, this.sceneManager));
        this.world.addSystem(new HealthBarSystem(this.world, this.sceneManager));
        this.world.addSystem(new RenderSystem(this.world));

        this.renderer.app.ticker.add((ticker) => {
            this.time.update(ticker);
            // Simulate the PIXI ticker object structure to not break old scenes immediately
            this.update({ deltaMS: this.time.deltaTime });
        });
    }

    update(delta) {
        // ECS update
        this.world.update(delta);
        
        // Classic update (backward compatible)
        this.sceneManager.update(delta);
        
        this.input.endFrame();
    }
}
