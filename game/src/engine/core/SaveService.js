/**
 * Maneja el guardado y carga de datos del juego hacia/desde el localStorage del navegador.
 */
export class SaveService {
    /**
     * @param {string} prefix El prefijo de espacio de nombres para las claves del local storage
     */
    constructor(prefix = 'last-bastion') {
        /** @type {string} Cadena de prefijo para prevenir colisiones de claves */
        this.prefix = prefix;
    }

    /**
     * Genera una clave de local storage totalmente cualificada para un espacio de guardado (slot) específico.
     * @private
     * @param {string} slot El identificador del espacio de guardado
     * @returns {string} La clave de local storage formateada
     */
    _key(slot) {
        return `${this.prefix}:${slot}`;
    }

    /**
     * Serializa y guarda los datos del juego en el espacio especificado.
     * @param {string} slot El identificador del espacio de guardado
     * @param {Object} data El objeto de estado serializable
     */
    save(slot, data) {
        localStorage.setItem(this._key(slot), JSON.stringify(data));
    }

    /**
     * Carga y analiza (parses) los datos del juego desde el espacio especificado.
     * @param {string} slot El identificador del espacio de guardado
     * @returns {Object|null} El objeto de estado analizado, o null si falla la carga o el espacio no existe
     */
    load(slot) {
        const raw = localStorage.getItem(this._key(slot));
        if (!raw) return null;

        try {
            return JSON.parse(raw);
        } catch (error) {
            console.error(`No se pudo leer el save "${slot}"`, error);
            return null;
        }
    }

    /**
     * Comprueba si existe un guardado en el espacio especificado.
     * @param {string} slot El identificador del espacio de guardado
     * @returns {boolean} Verdadero si el espacio contiene datos, falso de lo contrario
     */
    exists(slot) {
        return localStorage.getItem(this._key(slot)) !== null;
    }
}
