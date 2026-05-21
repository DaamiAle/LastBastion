/**
 * TopDownBase
 * 
 * Configuración base para juegos con vista de arriba hacia abajo.
 * Registra todos los sistemas en el orden correcto.
 * Separa gameplay de engine.
 */

import { InputSystem } from '../../engine/system/InputSystem.js';
import { AccelerationSystem } from '../../engine/system/AccelerationSystem.js';
import { MovementSystem } from '../../engine/system/MovementSystem.js';
import { CollisionSystem } from '../../engine/system/CollisionSystem.js';
import { AnimationStateSystem } from '../../engine/system/AnimationStateSystem.js';
import { AnimationSystem } from '../../engine/system/AnimationSystem.js';
import { RenderSystem } from '../../engine/system/RenderSystem.js';

import { collisionMatrix } from '../config/collisionMatrix.js';

/**
 * TopDownBase
 * Base configuration class para juegos top-down
 */
export class TopDownBase {
    /**
     * Registrar sistemas en la escena en el orden correcto
     * 
     * @param {Scene} scene - Escena donde registrar sistemas
     * @param {Runtime} runtime - Runtime para acceder a servicios
     */
    static registerSystems(scene, runtime) {
        const { grid, eventBus } = scene;

        // Order importante:
        // 1. Input (lee input del usuario)
        // 2. Acceleration (aplica aceleración según input)
        // 3. Movement (aplica velocidad)
        // 4. Collision (deteccion de colisiones)
        // 5. Animation (actualizar animaciones)
        // 6. AnimationState (cambiar estados de animación)
        // 7. Render (dibujar todo)

        scene.addSystem(new InputSystem(runtime.input), 0);
        scene.addSystem(new AccelerationSystem(), 100);
        scene.addSystem(new MovementSystem(), 200);
        
        const collisionSystem = new CollisionSystem(collisionMatrix, grid, eventBus);
        scene.addSystem(collisionSystem, 300);
        
        scene.addSystem(new AnimationStateSystem(), 400);
        scene.addSystem(new AnimationSystem(), 450);
        
        // RenderSystem usa el renderBackend de Runtime
        scene.addSystem(new RenderSystem(runtime.renderBackend), 500);
    }
}
