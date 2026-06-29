export class SaveService {
    constructor(prefix = 'last-bastion') {
        this.prefix = prefix;
    }

    _key(slot) {
        return `${this.prefix}:${slot}`;
    }

    save(slot, data) {
        localStorage.setItem(this._key(slot), JSON.stringify(data));
    }

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

    exists(slot) {
        return localStorage.getItem(this._key(slot)) !== null;
    }
}
