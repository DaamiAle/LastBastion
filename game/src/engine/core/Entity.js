import { Container } from 'pixi.js';

/**
 * Clase base para entidades clásicas orientadas a objetos (sistema legado/híbrido).
 * Cada entidad maneja su propio contenedor PixiJS, ciclo de vida y etiquetas (tags).
 */
export class Entity {
    /** @type {number} Contador estático para asignar IDs únicos empezando desde 1 */
    static nextId = 1;

    /**
     * @param {Object} scene Referencia a la escena a la que pertenece esta entidad
     */
    constructor(scene) {
        /** @type {Object} El contexto de la escena */
        this.scene = scene;

        /** @type {number} Identificador único para la entidad */
        this.id = Entity.nextId++;

        /** @type {string} Tipo de identificador para la entidad */
        this.type = "entity";
        
        /** @type {Set<string>} Colección de etiquetas (tags) para facilitar consultas */
        this.tags = new Set();

        /** @type {Container} Contenedor de visualización PixiJS */
        this.container = new Container();

        /** @type {boolean} Flag (indicador) que marca si la entidad está activa actualmente */
        this.isAlive = true;
    }

    /**
     * Llamado cuando la entidad se añade a la escena.
     * Adjunta su contenedor al contenedor principal de la escena.
     */
    enter() {
        this.scene.container.addChild(this.container);
    }

    /**
     * Llamado en cada fotograma para actualizar la lógica de la entidad.
     * @param {Object} delta Objeto que contiene información de tiempo delta
     */
    update(delta) { }

    /**
     * Destruye la entidad, eliminando su contenedor de la lista de visualización
     * y liberando los recursos asociados de PixiJS.
     */
    destroy() {
        if (!this.container) return;

        if (this.container.parent) {
            this.container.parent.removeChild(this.container);
        }

        this.container.destroy({ children: true });
        this.container = null;
    }

    /**
     * Añade una etiqueta (tag) de categorización a la entidad.
     * @param {string} tag La etiqueta a añadir
     */
    addTag(tag) {
        this.tags.add(tag);
    }

    /**
     * Comprueba si la entidad tiene una etiqueta (tag) específica.
     * @param {string} tag La etiqueta a comprobar
     * @returns {boolean} Verdadero si la entidad tiene la etiqueta, falso de lo contrario
     */
    hasTag(tag) {
        return this.tags.has(tag);
    }
}