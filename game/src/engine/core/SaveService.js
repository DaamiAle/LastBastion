/**
 * Handles saving and loading game data to/from the browser's localStorage.
 */
export class SaveService {
    /**
     * @param {string} prefix The namespace prefix for local storage keys
     */
    constructor(prefix = 'last-bastion') {
        /** @type {string} Prefix string to prevent key collisions */
        this.prefix = prefix;
    }

    /**
     * Generates a fully qualified local storage key for a specific save slot.
     * @private
     * @param {string} slot The save slot identifier
     * @returns {string} The formatted local storage key
     */
    _key(slot) {
        return `${this.prefix}:${slot}`;
    }

    /**
     * Serializes and saves game data to the specified slot.
     * @param {string} slot The save slot identifier
     * @param {Object} data The serializable state object
     */
    save(slot, data) {
        localStorage.setItem(this._key(slot), JSON.stringify(data));
    }

    /**
     * Loads and parses game data from the specified slot.
     * @param {string} slot The save slot identifier
     * @returns {Object|null} The parsed state object, or null if loading fails or slot doesn't exist
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
     * Checks if a save exists in the specified slot.
     * @param {string} slot The save slot identifier
     * @returns {boolean} True if the slot contains data, false otherwise
     */
    exists(slot) {
        return localStorage.getItem(this._key(slot)) !== null;
    }
}
