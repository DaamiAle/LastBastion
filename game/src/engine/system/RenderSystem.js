/**
 * RenderSystem
 * 
 * Sincroniza componentes ECS con el backend de renderizado.
 * Usa queries para encontrar entidades relevantes eficientemente.
 */

import { Transform } from '../world/components/Transform.js';
import { Sprite as SpriteComponent } from '../world/components/Sprite.js';
import { Pivot } from '../world/components/Pivot.js';

export class RenderSystem {
    /**
     * @param {IRenderBackend} renderBackend - Backend de renderizado
     */
    constructor(renderBackend) {
        this.backend = renderBackend;
        
        // Map de entityId -> RenderHandle
        this.renderHandles = new Map();
        
        // Query cache (se inicializa en primer update)
        this.query = null;
    }

    /**
     * Actualizar todos los sprites
     */
    update(entities, delta, scene = null) {
        // Si tenemos acceso a scene, usar query manager
        // Sino, usar entities array (backwards compatible)
        if (scene && !this.query) {
            this.query = scene.query([Transform, SpriteComponent]);
        }

        const entitiesToRender = this.query ? this.query.entities : entities;

        for (const entity of entitiesToRender) {
            const transform = entity.get(Transform);
            const spriteComp = entity.get(SpriteComponent);

            if (!transform || !spriteComp) continue;

            // ===========================
            // GET or CREATE render handle
            // ===========================
            let handle = this.renderHandles.get(entity.id);
            
            if (!handle || !handle.isValid()) {
                handle = this.backend.createSprite();
                this.renderHandles.set(entity.id, handle);
            }

            // ===========================
            // SYNC VISIBILITY
            // ===========================
            const shouldBeVisible = entity.active && spriteComp.visible;
            this.backend.setVisible(handle, shouldBeVisible);

            if (!shouldBeVisible) continue;

            // ===========================
            // SYNC TEXTURE
            // ===========================
            if (spriteComp.texture) {
                this.backend.setTexture(handle, spriteComp.texture);
            }

            // ===========================
            // SYNC ANCHOR/PIVOT
            // ===========================
            const pivot = entity.get(Pivot);
            if (pivot && pivot.dirty) {
                this.backend.setAnchor(handle, spriteComp.anchorX, spriteComp.anchorY);
                pivot.dirty = false;
            } else {
                this.backend.setAnchor(handle, spriteComp.anchorX, spriteComp.anchorY);
            }

            // ===========================
            // SYNC TRANSFORM
            // ===========================
            this.backend.setPosition(handle, transform.position.x, transform.position.y);
            this.backend.setScale(handle, transform.scale.x, transform.scale.y);
            this.backend.setRotation(handle, transform.rotation);

            // ===========================
            // SYNC Z-INDEX
            // ===========================
            this.backend.setZIndex(handle, spriteComp.zIndex);
        }

        // ===========================
        // CLEANUP - Limpiar entidades inactivas
        // ===========================
        const deadEntities = [];
        for (const [entityId, handle] of this.renderHandles) {
            const entity = entities.find(e => e.id === entityId);
            if (!entity || !entity.active) {
                this.backend.destroySprite(handle);
                deadEntities.push(entityId);
            }
        }
        
        for (const entityId of deadEntities) {
            this.renderHandles.delete(entityId);
        }
    }

    /**
     * Limpiar todos los renders al destruir el system
     */
    destroy() {
        for (const handle of this.renderHandles.values()) {
            if (handle.isValid()) {
                this.backend.destroySprite(handle);
            }
        }
        this.renderHandles.clear();
    }
}