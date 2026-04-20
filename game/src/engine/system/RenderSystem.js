import { Transform } from '../world/components/Transform.js';
import { Sprite as SpriteComponent } from '../world/components/Sprite.js';
import { Sprite as PixiSprite } from 'pixi.js';

export class RenderSystem {
    constructor(stage) {
        this.stage = stage;
    }

    update(entities) {
        for (const e of entities) {
            // Obtener componentes necesarios
            const transform = e.get(Transform);
            const spriteComp = e.get(SpriteComponent);
            // si falta alguno, saltar
            if (!e.has(Transform) || !e.has(SpriteComponent)) continue;

            // crear sprite si no existe
            if (!spriteComp.sprite) {
                const spritePixi = new PixiSprite(spriteComp.texture);
                // Usamos la propiedad "scale" del transform para ajustar el tamaño del sprite 1 es exactamente el tamaño de la textura, 2 es el doble, etc.
                spritePixi.scale.set(transform.scale.x, transform.scale.y);
                this.stage.addChild(spritePixi);

                spriteComp.sprite = spritePixi;
            }
            const sprite = spriteComp.sprite;

            // actualizar posición del sprite
            sprite.x = transform.position.x;
            sprite.y = transform.position.y;
        }
    }
}