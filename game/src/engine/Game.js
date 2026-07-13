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
 * Clase principal del juego (Game). Inicializa el motor, los sistemas principales (ECS, Renderer, Input),
 * y maneja el bucle principal del juego.
 */
export class Game {
    /**
     * Inicializa todos los administradores (managers) y servicios principales antes de que se carguen los recursos (assets).
     */
    constructor() {
        /** @type {Object} Objeto de configuración global */
        this.config = GAME_CONFIG;
        /** @type {Time} Administración del tiempo y cálculo del delta */
        this.time = new Time();
        /** @type {Renderer} Envoltorio (wrapper) del renderizador de PixiJS */
        this.renderer = new Renderer(this.config);
        /** @type {World} Mundo (World) del sistema de Entidad-Componente-Sistema (ECS) */
        this.world = new World();
        /** @type {SceneManager} Maneja los estados del juego/escenas */
        this.sceneManager = new SceneManager(this);
        /** @type {Input} Maneja las entradas (inputs) del teclado y ratón */
        this.input = new Input();
        /** @type {SaveService} Maneja las operaciones de guardado local */
        this.save = new SaveService();
        /** @type {Object} Recursos (assets) del juego cargados (texturas, hojas de sprites, etc) */
        this.assets = {};
    }

    /**
     * Carga de manera asíncrona los recursos (assets), inicializa el sonido y prepara los sistemas ECS.
     * Inicia el bucle (loop) principal del ticker de PixiJS.
     * @returns {Promise<void>}
     */
    async init() {
        await this.renderer.init();
        
        // Exponer la app para retrocompatibilidad durante la migración
        this.app = this.renderer.app; 

        SoundManager.init();
        this.assets = await AssetLoader.loadAllAssets();

        // Registrar sistemas ECS
        // Los sistemas AISystems requieren una referencia a la escena/administrador de escenas activa para consultar el entorno
        this.world.addSystem(new ZombieAISystem(this.world));
        this.world.addSystem(new TurretAISystem(this.world, this.sceneManager));
        this.world.addSystem(new MovementSystem(this.world, this.sceneManager));
        this.world.addSystem(new CollisionSystem(this.world, this.sceneManager));
        this.world.addSystem(new CombatSystem(this.world, this.sceneManager));
        this.world.addSystem(new HealthBarSystem(this.world, this.sceneManager));
        
        // El sistema de renderizado (RenderSystem) debe ejecutarse último
        this.world.addSystem(new RenderSystem(this.world));

        // Iniciar el bucle principal del juego
        this.renderer.app.ticker.add((ticker) => {
            this.time.update(ticker);
            // Pasar el delta hacia abajo simulando el antiguo objeto ticker de PIXI
            this.update({ deltaMS: this.time.deltaTime });
        });
    }

    /**
     * Bucle de actualización principal (update loop) llamado cada fotograma.
     * Actualiza el mundo ECS, la escena activa, y restablece las entradas (inputs) específicas del fotograma.
     * @param {Object} delta Objeto que contiene el tiempo delta (diferencia de tiempo) en milisegundos
     */
    update(delta) {
        // Bucle de actualización ECS
        this.world.update(delta);
        
        // Lógica de actualización de la escena activa
        this.sceneManager.update(delta);
        
        // Restablecer estados de entrada de un solo fotograma (ej. teclas presionadas en este fotograma)
        this.input.endFrame();
    }
}

