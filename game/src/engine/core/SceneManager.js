/**
 * Administra las escenas del juego, permitiendo transiciones seguras entre ellas.
 */
export class SceneManager {
    /**
     * @param {Object} game Referencia a la instancia principal del juego
     */
    constructor(game) {
        /** @type {Object} La instancia principal del juego */
        this.game = game;

        /** @type {Scene|null} La escena activa actualmente */
        this.current = null;
        
        /** @type {Scene|null} La escena pendiente a cambiar en el siguiente fotograma */
        this.next = null;
    }

    /**
     * Obtiene la escena activa actualmente.
     * @returns {Scene|null}
     */
    get currentScene() {
        return this.current;
    }

    /**
     * Solicita un cambio de escena. La transición real ocurre de manera segura 
     * al inicio del siguiente ciclo de actualización.
     * @param {Scene} scene La nueva escena a la que transicionar
     */
    change(scene) {
        this.next = scene;
    }

    /**
     * Actualiza la escena activa y maneja las transiciones de escena pendientes.
     * @param {Object} delta Objeto de delta de tiempo
     */
    update(delta) {
        // Aplicar los cambios de escena de manera segura antes de ejecutar la lógica de actualización
        if (this.next) {
            if (this.current) {
                this.current.exit();
            }

            this.current = this.next;
            this.next = null;

            this.current.enter();
        }

        if (this.current) {
            this.current.update(delta);
        }
    }
}