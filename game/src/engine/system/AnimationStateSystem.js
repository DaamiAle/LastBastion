// src/engine/system/AnimationStateSystem.js

import { Animation } from '../world/components/Animation.js';
import { Velocity } from '../world/components/Velocity.js';

/**
 * AnimationStateSystem - agnóstico del gameplay
 * 
 * Mapea velocidad a estados de animación basado en una tabla configurable.
 * Ejemplo:
 *   new AnimationStateSystem({ low: 'idle', high: 'walk' }, 1.0)
 * 
 * Para un juego diferente:
 *   new AnimationStateSystem({ slow: 'walk', fast: 'run', super: 'sprint' }, 50, 150)
 */
export class AnimationStateSystem {
    constructor(stateMap = { low: 'idle', high: 'walk' }, speedThreshold = 1) {
        this.stateMap = stateMap;
        this.speedThreshold = speedThreshold;
    }

    update(entities) {
        for (const e of entities) {
            const anim = e.get(Animation);
            const vel = e.get(Velocity);

            if (!anim || !vel) continue;

            const speedSq = vel.x * vel.x + vel.y * vel.y;

            // Determinar estado basado en mapa configurable
            const targetState = speedSq > (this.speedThreshold * this.speedThreshold)
                ? this.stateMap.high
                : this.stateMap.low;

            if (targetState && anim.current !== targetState) {
                anim.play(targetState);
            }
        }
    }
}
