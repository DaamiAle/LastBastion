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
import { CollisionResolutionSystem } from '../../engine/system/CollisionResolutionSystem.js';
import { ParticleSystem } from '../../engine/system/ParticleSystem.js';
import { AnimationStateSystem } from '../../engine/system/AnimationStateSystem.js';
import { AnimationSystem } from '../../engine/system/AnimationSystem.js';
import { RenderSystem } from '../../engine/system/RenderSystem.js';

import { BoidSystem } from '../../gameplay/systems/BoidSystem.js';

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
        // 2. BoidSystem (calcula fuerzas de steering de los zombies)
        // 3. Acceleration (aplica aceleración según input/steering)
        // 4. Movement (aplica velocidad)
        // 5. Collision (deteccion de colisiones)
        // 6. CollisionResolution (empuja los objetos solapados)
        // 7. Animation (actualizar animaciones)
        // 8. AnimationState (cambiar estados de animación)
        // 9. Particle (actualiza y dibuja partículas)
        // 10. Render (dibujar todo)

        scene.addSystem(new InputSystem(runtime.input), 0);
        scene.addSystem(new BoidSystem(), 80);
        scene.addSystem(new AccelerationSystem(), 100);
        scene.addSystem(new MovementSystem(), 200);
        
        const collisionSystem = new CollisionSystem(collisionMatrix, grid, eventBus);
        scene.addSystem(collisionSystem, 300);
        scene.addSystem(new CollisionResolutionSystem(collisionMatrix, grid), 310);
        
        scene.addSystem(new AnimationStateSystem(), 400);
        scene.addSystem(new AnimationSystem(), 450);
        scene.addSystem(new ParticleSystem(runtime.renderBackend), 480);
        
        // RenderSystem usa el renderBackend de Runtime
        scene.addSystem(new RenderSystem(runtime.renderBackend), 500);
    }
}
