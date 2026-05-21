/**
 * PixiRenderBackend
 * 
 * Implementación concreta usando PixiJS.
 * Este es el ÚNICO lugar del engine donde se importa Pixi.
 * 
 * Todos los detalles de Pixi quedan encapsulados aquí.
 */

import * as PIXI from 'pixi.js';
import { IRenderBackend } from './IRenderBackend.js';
import { RenderHandle } from './RenderHandle.js';

export class PixiRenderBackend extends IRenderBackend {
    /**
     * @param {PIXI.Application} pixiApp - La aplicación Pixi existente
     */
    constructor(pixiApp) {
        super();
        this.app = pixiApp;
        this.stage = pixiApp.stage;
    }

    /**
     * Crear un nuevo sprite
     */
    createSprite() {
        const pixiSprite = new PIXI.Sprite();
        const handle = new RenderHandle({ pixiSprite });
        this.stage.addChild(pixiSprite);
        return handle;
    }

    /**
     * Destruir un sprite
     */
    destroySprite(handle) {
        if (!handle || !handle.isValid()) return;

        const { pixiSprite } = handle.internal;
        if (pixiSprite && pixiSprite.parent) {
            pixiSprite.parent.removeChild(pixiSprite);
        }
        handle.invalidate();
    }

    /**
     * Establecer posición
     */
    setPosition(handle, x, y) {
        if (!handle || !handle.isValid()) return;
        const { pixiSprite } = handle.internal;
        pixiSprite.x = x;
        pixiSprite.y = y;
    }

    /**
     * Establecer escala
     */
    setScale(handle, scaleX, scaleY) {
        if (!handle || !handle.isValid()) return;
        const { pixiSprite } = handle.internal;
        pixiSprite.scale.set(scaleX, scaleY);
    }

    /**
     * Establecer rotación
     */
    setRotation(handle, rotation) {
        if (!handle || !handle.isValid()) return;
        const { pixiSprite } = handle.internal;
        pixiSprite.rotation = rotation;
    }

    /**
     * Establecer textura
     */
    setTexture(handle, texture) {
        if (!handle || !handle.isValid()) return;
        const { pixiSprite } = handle.internal;
        if (texture) {
            pixiSprite.texture = texture;
        }
    }

    /**
     * Establecer visibilidad
     */
    setVisible(handle, visible) {
        if (!handle || !handle.isValid()) return;
        const { pixiSprite } = handle.internal;
        pixiSprite.visible = visible;
    }

    /**
     * Establecer anchor/pivot
     */
    setAnchor(handle, x, y) {
        if (!handle || !handle.isValid()) return;
        const { pixiSprite } = handle.internal;
        pixiSprite.anchor.set(x, y);
    }

    /**
     * Establecer z-index
     */
    setZIndex(handle, zIndex) {
        if (!handle || !handle.isValid()) return;
        const { pixiSprite } = handle.internal;
        // En Pixi, el z-index está determinado por la posición en el children array
        // Intentamos reordenar
        const parent = pixiSprite.parent;
        if (parent) {
            parent.removeChild(pixiSprite);
            parent.addChildAt(pixiSprite, Math.min(zIndex, parent.children.length));
        }
    }

    /**
     * Agregar a stage
     */
    addToStage(handle) {
        if (!handle || !handle.isValid()) return;
        const { pixiSprite } = handle.internal;
        if (pixiSprite.parent !== this.stage) {
            this.stage.addChild(pixiSprite);
        }
    }

    /**
     * Remover de stage
     */
    removeFromStage(handle) {
        if (!handle || !handle.isValid()) return;
        const { pixiSprite } = handle.internal;
        if (pixiSprite.parent) {
            pixiSprite.parent.removeChild(pixiSprite);
        }
    }

    /**
     * Obtener canvas
     */
    getCanvas() {
        return this.app.canvas;
    }
}
