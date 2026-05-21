// src/engine/world/components/Input.js

/**
 * Input Component - agnóstico de controles
 * 
 * Permite definir CUALQUIER mapeo de teclas a acciones.
 * Ejemplos:
 *   - Top-down: {up: 'KeyW', down: 'KeyS', left: 'KeyA', right: 'KeyD'}
 *   - 3D FPS: {forward: 'KeyW', backward: 'KeyS', strafe_left: 'KeyA', strafe_right: 'KeyD', jump: 'Space'}
 *   - Juego de lucha: {punch: 'KeyX', kick: 'KeyZ', special: 'KeyC', block: 'Space'}
 * 
 * InputSystem leerá estos bindings y escribirá en actions[actionName].
 */
export class Input {
    constructor({
        speed = 150,
        bindings = {
            up: 'KeyW',
            down: 'KeyS',
            left: 'KeyA',
            right: 'KeyD'
        },
        faceMovement = false
    } = {}) {
        this.speed = speed;
        // bindings: mapeo de {actionName: keyCode}
        this.bindings = bindings;
        // actions: estado actual de cada acción {actionName: boolean}
        this.actions = {};
        // Dirección normalizada (solo si bindings tiene up/down/left/right)
        this.direction = { x: 0, y: 0 };
        // Si true, la entidad rotará hacia la dirección del input
        this.faceMovement = faceMovement;
    }
}