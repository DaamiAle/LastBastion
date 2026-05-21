// src/engine/system/AnimationSystem.js

import { Animation } from '../world/components/Animation.js';
import { Sprite } from '../world/components/Sprite.js';
import { Pivot } from '../world/components/Pivot.js';

export class AnimationSystem {
    update(entities, time) {
        const dt = time.deltaTime;

        for (const entity of entities) {
            const anim = entity.get(Animation);
            const sprite = entity.get(Sprite);

            if (!anim || !sprite || !anim.current) continue;

            const clip = anim.clip;

            if (!clip || clip.frames.length === 0) continue;

            // avanzar tiempo
            anim.elapsed += dt;

            // proteger contra frameDuration inválido (evita bucle infinito)
            if (clip.frameDuration > 0) {
                while (anim.elapsed >= clip.frameDuration) {
                    anim.elapsed -= clip.frameDuration;
                    anim.frameIndex++;

                    if (anim.frameIndex >= clip.frames.length) {
                        anim.frameIndex = clip.loop
                            ? 0
                            : clip.frames.length - 1;
                    }
                }
            }

            const frame = anim.currentFrame;
            if (!frame) continue;

            sprite.texture = frame.texture;

            const pivot = entity.get(Pivot);
            if (pivot && frame.pivot) {
                pivot.x = frame.pivot.x;
                pivot.y = frame.pivot.y;
                // marcar dirty para que RenderSystem actualice anchor
                pivot.dirty = true;
            }
        }
    }
}