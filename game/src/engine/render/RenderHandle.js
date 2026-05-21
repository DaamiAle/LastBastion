/**
 * RenderHandle
 * 
 * Contenedor opaco para referencias a objetos gráficos.
 * Encapsula detalles de implementación del backend.
 * 
 * El ECS NUNCA accede directamente a handle.pixiSprite.
 * Solo el backend manipula el contenido interno.
 */

export class RenderHandle {
    constructor(internalData = {}) {
        // Datos internos específicos del backend
        // (pixiSprite, canvas context, WebGL shader, etc.)
        this._internal = internalData;
        this.id = Math.random().toString(36).substr(2, 9);
    }

    /**
     * Getter interno para el backend
     * @internal
     */
    get internal() {
        return this._internal;
    }

    /**
     * Setter interno para el backend
     * @internal
     */
    set internal(data) {
        this._internal = data;
    }

    /**
     * Invalidar el handle
     */
    invalidate() {
        this._internal = null;
    }

    /**
     * Verificar si es válido
     */
    isValid() {
        return this._internal !== null;
    }
}
