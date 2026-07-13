import { Container } from 'pixi.js';
import { clamp, lerp } from '../utils/Utils.js';

/**
 * Clase base para todas las escenas del juego. 
 * Maneja el contenedor de visualización, las entidades clásicas, y el movimiento de la cámara.
 */
export class Scene {
    /**
     * @param {Object} game Referencia a la instancia principal de Game
     */
    constructor(game) {
        /** @type {Object} La instancia principal del juego */
        this.game = game;

        /** @type {Container|null} El contenedor principal de PixiJS para esta escena */
        this.container = null;
        
        /** @type {Array<Object>} Lista de entidades clásicas manejadas por esta escena */
        this.entities = [];
        
        /** @type {Object|null} La entidad que la cámara está siguiendo actualmente */
        this.cameraTarget = null;
        
        /** @type {number} El factor de interpolación para el movimiento de la cámara (0-1) */
        this.cameraLerp = 0.1;
        
        /** @type {number} El ancho total de los límites del mundo de la escena */
        this.worldWidth = 2200;
        
        /** @type {number} El alto total de los límites del mundo de la escena */
        this.worldHeight = 1400;
    }

    /**
     * Llamado cuando la escena se vuelve activa.
     * Inicializa el contenedor y lo añade al escenario (stage).
     */
    enter() {
        this.container = new Container();
        this.container.sortableChildren = true;
        this.game.app.stage.addChild(this.container);
    }

    /**
     * Registra una entidad clásica a la escena y llama a su método enter.
     * @param {Object} entity La entidad a añadir
     */
    addEntity(entity) {
        this.entities.push(entity);
        entity.enter();
    }

    /**
     * Actualiza todas las entidades activas y la cámara.
     * Limpia las entidades muertas.
     * @param {Object} delta Objeto de delta de tiempo
     */
    update(delta) {
        for (const entity of this.entities) {
            if (entity.isAlive) {
                entity.update(delta);
            }
        }

        this.entities = this.entities.filter((entity) => {
            if (!entity.isAlive) {
                entity.destroy();
                return false;
            }

            return true;
        });

        this.updateCamera();
    }

    /**
     * Llamado cuando la escena está siendo reemplazada.
     * Destruye todas las entidades y limpia el contenedor.
     */
    exit() {
        for (const entity of this.entities) {
            entity.destroy();
        }

        this.entities = [];

        if (this.container) {
            this.container.destroy({ children: true });
            this.container = null;
        }
    }

    /**
     * Establece la entidad que la cámara debe seguir.
     * @param {Object} entity Entidad objetivo a seguir
     */
    setCameraTarget(entity) {
        this.cameraTarget = entity;
    }

    /**
     * Actualiza los límites lógicos del mundo de la escena.
     * @param {number} width 
     * @param {number} height 
     */
    setWorldSize(width, height) {
        this.worldWidth = width;
        this.worldHeight = height;
    }

    /**
     * Convierte coordenadas de pantalla del DOM a coordenadas del mundo/escena.
     * @param {number} screenX 
     * @param {number} screenY 
     * @returns {{x: number, y: number}} Las coordenadas en el espacio del mundo
     */
    screenToWorld(screenX, screenY) {
        const rect = this.game.app.canvas.getBoundingClientRect();
        const scaleX = this.game.app.renderer.width / rect.width;
        const scaleY = this.game.app.renderer.height / rect.height;
        const x = (screenX - rect.left) * scaleX;
        const y = (screenY - rect.top) * scaleY;

        return {
            x: x - this.container.x,
            y: y - this.container.y
        };
    }

    /**
     * Convierte coordenadas del mundo/escena a coordenadas de pantalla del DOM.
     * @param {number} worldX 
     * @param {number} worldY 
     * @returns {{x: number, y: number}} Las coordenadas en el espacio de la pantalla
     */
    worldToScreen(worldX, worldY) {
        return {
            x: worldX + this.container.x,
            y: worldY + this.container.y
        };
    }

    /**
     * Mueve el contenedor de la escena para mantener centrado al objetivo de la cámara,
     * aplicando suavizado (lerp) y limitando (clamping) dentro de los límites del mundo.
     */
    updateCamera() {
        if (!this.container || !this.cameraTarget?.container) return;

        const renderer = this.game.app.renderer;
        const desiredX = renderer.width * 0.5 - this.cameraTarget.container.x;
        const desiredY = renderer.height * 0.5 - this.cameraTarget.container.y;
        
        // Evitar que la cámara muestre áreas fuera de los límites del mundo
        const minX = Math.min(0, renderer.width - this.worldWidth);
        const minY = Math.min(0, renderer.height - this.worldHeight);
        
        const clampedX = clamp(desiredX, minX, 0);
        const clampedY = clamp(desiredY, minY, 0);

        this.container.x = lerp(this.container.x, clampedX, this.cameraLerp);
        this.container.y = lerp(this.container.y, clampedY, this.cameraLerp);
    }
}
