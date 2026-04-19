import { Sprite as PixiSprite } from 'pixi.js';
import { Transform } from '../world/components/Transform.js';
import { Sprite } from '../world/components/Sprite.js';

export class RenderSystem {
    constructor(stage) {
        this.stage = stage;
    }

    update(entities) {
        for (const e of entities) {
            const transform = e.get(Transform);
            const sprite = e.get(Sprite);

            if (!transform || !sprite) continue;

            if (!sprite.view) {
                sprite.view = new PixiSprite(sprite.texture);
                this.stage.addChild(sprite.view);
            }

            const view = sprite.view;

            view.x = transform.position.x;
            view.y = transform.position.y;

            view.scale.set(transform.scale.x, transform.scale.y);
            view.rotation = transform.rotation;
        }
    }
}