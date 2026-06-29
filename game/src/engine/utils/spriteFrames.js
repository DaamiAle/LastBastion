import { Rectangle, Texture } from 'pixi.js';

export function createFramesFromMeta(texture, sprites) {
    return sprites.map((sprite) => {
        const y = texture.height - sprite.rect.y - sprite.rect.height;
        const frame = new Rectangle(
            sprite.rect.x,
            y,
            sprite.rect.width,
            sprite.rect.height
        );

        return new Texture({
            source: texture.source,
            frame
        });
    });
}
