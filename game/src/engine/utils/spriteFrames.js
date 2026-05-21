// src/engine/utils/spriteFrames.js

import { Texture, Rectangle } from 'pixi.js';

export function createFramesFromMeta(texture, sprites) {
    return sprites.map(s => {

        const y = texture.height - s.rect.y - s.rect.height;

        const frame = new Rectangle(
            s.rect.x,
            y,
            s.rect.width,
            s.rect.height
        );

        const frameTexture = new Texture({
            source: texture.source,
            frame: frame
        });

        return {
            texture: frameTexture,
            pivot: s.pivot,
            name: s.name
        };
    });
}
