import { Rectangle, Texture } from 'pixi.js';

/**
 * Creates individual PixiJS Texture frames from a spritesheet texture and its metadata.
 * Adjusts the Y-coordinate to handle potential coordinate system differences (bottom-left vs top-left).
 * @param {Texture} texture The base spritesheet texture
 * @param {Array<Object>} sprites Array of sprite metadata defining rects
 * @returns {Array<Texture>} Array of individual texture frames
 */
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
