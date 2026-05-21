// src/engine/system/InputSystem.js

import { Input } from '../world/components/Input.js';

/**
 * InputSystem - Agnóstico del gameplay
 * 
 * Lee input desde InputService y actualiza componentes Input.
 * NO asume estructura de bindings. Cada entidad define sus propias acciones.
 * 
 * Ejemplos de bindings:
 *   - Top-down: {up: 'KeyW', down: 'KeyS', left: 'KeyA', right: 'KeyD'}
 *   - 3D FPS: {forward: 'KeyW', backward: 'KeyS', jump: 'Space', crouch: 'KeyC'}
 *   - Juego de lucha: {punch: 'KeyX', kick: 'KeyZ', block: 'Space'}
 */
export class InputSystem {
    constructor(inputService) {
        this.input = inputService;
    }

    update(entities) {
        for (const e of entities) {
            const inputComp = e.get(Input);
            if (!inputComp) continue;

            // Actualizar estado de TODAS las acciones definidas en bindings
            inputComp.actions = inputComp.actions || {};
            
            for (const [actionName, keyCode] of Object.entries(inputComp.bindings)) {
                inputComp.actions[actionName] = this.input.isDown(keyCode);
            }

            // Si los bindings tienen direccionales (up/down/left/right), calcular direction
            // Esto permite reutilización: componentes con dirección la obtienen automáticamente
            if (inputComp.bindings.up || inputComp.bindings.down || inputComp.bindings.left || inputComp.bindings.right) {
                let x = 0;
                let y = 0;

                if (inputComp.actions.up) y -= 1;
                if (inputComp.actions.down) y += 1;
                if (inputComp.actions.left) x -= 1;
                if (inputComp.actions.right) x += 1;

                // normalización
                if (x !== 0 && y !== 0) {
                    const inv = 1 / Math.sqrt(2);
                    x *= inv;
                    y *= inv;
                }

                inputComp.direction.x = x;
                inputComp.direction.y = y;
            }
        }
    }
}