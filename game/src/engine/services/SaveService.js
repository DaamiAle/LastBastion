// src/engine/services/SaveService.js

export class SaveService {
    constructor(prefix = 'game') {
        this.prefix = prefix;
    }

    save(slot, data) {
        const key = `${this.prefix}:${slot}`;
        const json = JSON.stringify(data);

        localStorage.setItem(key, json);
    }

    load(slot) {
        const key = `${this.prefix}:${slot}`;
        const json = localStorage.getItem(key);

        if (!json) return null;

        try {
            return JSON.parse(json);
        } catch (e) {
            console.error(`SaveService.load: failed to parse slot ${slot}`, e);
            return null;
        }
    }

    delete(slot) {
        const key = `${this.prefix}:${slot}`;
        localStorage.removeItem(key);
    }

    exists(slot) {
        const key = `${this.prefix}:${slot}`;
        return localStorage.getItem(key) !== null;
    }
}