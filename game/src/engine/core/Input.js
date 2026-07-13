/**
 * Administrador global de entradas (input).
 * Rastrea el estado del teclado y el ratón a lo largo del ciclo de vida de la aplicación.
 */
export class Input {
    /**
     * Inicializa las estructuras de estado de entrada y enlaza (binds) los escuchadores de eventos del DOM.
     */
    constructor() {
        /** @type {Set<string>} Teclas actualmente mantenidas presionadas */
        this.keys = new Set();
        /** @type {Set<string>} Teclas presionadas durante el fotograma actual */
        this.pressedKeys = new Set();
        /** @type {Set<string>} Teclas soltadas durante el fotograma actual */
        this.releasedKeys = new Set();
        
        /** 
         * Estructura de estado del ratón
         * @type {{x: number, y: number, leftDown: boolean, leftPressed: boolean, leftReleased: boolean}}
         */
        this.mouse = {
            x: 0,
            y: 0,
            leftDown: false,
            leftPressed: false,
            leftReleased: false
        };

        window.addEventListener('keydown', (e) => {
            if (!this.keys.has(e.code)) {
                this.pressedKeys.add(e.code);
            }

            this.keys.add(e.code);
        });

        window.addEventListener('keyup', (e) => {
            this.keys.delete(e.code);
            this.releasedKeys.add(e.code);
        });

        window.addEventListener('mousemove', (e) => {
            this.mouse.x = e.clientX;
            this.mouse.y = e.clientY;
        });

        window.addEventListener('mousedown', (e) => {
            if (e.button !== 0) return;

            this.mouse.leftDown = true;
            this.mouse.leftPressed = true;
            this.mouse.x = e.clientX;
            this.mouse.y = e.clientY;
        });

        window.addEventListener('mouseup', (e) => {
            if (e.button !== 0) return;

            this.mouse.leftDown = false;
            this.mouse.leftReleased = true;
            this.mouse.x = e.clientX;
            this.mouse.y = e.clientY;
        });
    }

    /**
     * Comprueba si una tecla está actualmente mantenida presionada.
     * @param {string} key El código de la tecla (ej., "Space", "KeyW")
     * @returns {boolean} Verdadero si la tecla está presionada
     */
    isKeyDown(key) {
        return this.keys.has(key);
    }

    /**
     * Comprueba si una tecla fue presionada precisamente en el fotograma actual.
     * @param {string} key El código de la tecla
     * @returns {boolean} Verdadero si la tecla acaba de ser presionada
     */
    wasKeyPressed(key) {
        return this.pressedKeys.has(key);
    }

    /**
     * Comprueba si el botón izquierdo del ratón fue presionado en el fotograma actual.
     * @returns {boolean} Verdadero si el botón izquierdo del ratón acaba de ser presionado
     */
    wasMousePressed() {
        return this.mouse.leftPressed;
    }

    /**
     * Limpia los estados de entrada específicos del fotograma.
     * Debe ser llamado al final del paso de actualización del bucle del juego.
     */
    endFrame() {
        this.pressedKeys.clear();
        this.releasedKeys.clear();
        this.mouse.leftPressed = false;
        this.mouse.leftReleased = false;
    }
}
