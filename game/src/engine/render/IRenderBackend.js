/**
 * IRenderBackend
 * 
 * Interfaz abstracta para cualquier backend de rendering.
 * Encapsula todas las operaciones de renderizado.
 * 
 * El engine NUNCA importa Pixi directamente.
 * Todas las operaciones Pixi viven aquí.
 */

export class IRenderBackend {
    /**
     * Crear un handle de sprite
     * @returns {RenderHandle}
     */
    createSprite() {
        throw new Error('IRenderBackend.createSprite() must be implemented');
    }

    /**
     * Destruir un sprite
     * @param {RenderHandle} handle
     */
    destroySprite(handle) {
        throw new Error('IRenderBackend.destroySprite() must be implemented');
    }

    /**
     * Establecer posición
     * @param {RenderHandle} handle
     * @param {number} x
     * @param {number} y
     */
    setPosition(handle, x, y) {
        throw new Error('IRenderBackend.setPosition() must be implemented');
    }

    /**
     * Establecer escala
     * @param {RenderHandle} handle
     * @param {number} scaleX
     * @param {number} scaleY
     */
    setScale(handle, scaleX, scaleY) {
        throw new Error('IRenderBackend.setScale() must be implemented');
    }

    /**
     * Establecer rotación (en radianes)
     * @param {RenderHandle} handle
     * @param {number} rotation
     */
    setRotation(handle, rotation) {
        throw new Error('IRenderBackend.setRotation() must be implemented');
    }

    /**
     * Establecer textura
     * @param {RenderHandle} handle
     * @param {*} texture - Textura del backend específico
     */
    setTexture(handle, texture) {
        throw new Error('IRenderBackend.setTexture() must be implemented');
    }

    /**
     * Establecer visibilidad
     * @param {RenderHandle} handle
     * @param {boolean} visible
     */
    setVisible(handle, visible) {
        throw new Error('IRenderBackend.setVisible() must be implemented');
    }

    /**
     * Establecer anchor/pivot
     * @param {RenderHandle} handle
     * @param {number} x
     * @param {number} y
     */
    setAnchor(handle, x, y) {
        throw new Error('IRenderBackend.setAnchor() must be implemented');
    }

    /**
     * Establecer z-index
     * @param {RenderHandle} handle
     * @param {number} zIndex
     */
    setZIndex(handle, zIndex) {
        throw new Error('IRenderBackend.setZIndex() must be implemented');
    }

    /**
     * Agregar a stage
     * @param {RenderHandle} handle
     */
    addToStage(handle) {
        throw new Error('IRenderBackend.addToStage() must be implemented');
    }

    /**
     * Remover de stage
     * @param {RenderHandle} handle
     */
    removeFromStage(handle) {
        throw new Error('IRenderBackend.removeFromStage() must be implemented');
    }

    /**
     * Obtener canvas (para testing/screenshot)
     * @returns {HTMLCanvasElement}
     */
    getCanvas() {
        throw new Error('IRenderBackend.getCanvas() must be implemented');
    }
}
