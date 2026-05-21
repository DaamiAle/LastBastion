// src/engine/services/AssetLoader.js

import { Assets } from 'pixi.js';

export class AssetLoader {
    constructor() {
        this.cache = new Map();
    }

    async load(name, path) {
        if (this.cache.has(name)) {
            return this.cache.get(name);
        }

        let asset;

        if (path.endsWith('.json')) {
            asset = await fetch(path).then(r => r.json());
        } else {
            asset = await Assets.load(path);
        }

        this.cache.set(name, asset);
        return asset;
    }

    get(name) {
        return this.cache.get(name);
    }

    has(name) {
        return this.cache.has(name);
    }
}