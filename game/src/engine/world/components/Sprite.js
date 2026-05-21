/**
 * Sprite Component
 * 
 * SOLO contiene DATOS.
 * NO contiene referencias a objetos Pixi.
 * NO contiene callbacks.
 * 
 * El RenderSystem mantiene los handles internamente.
 */

export class Sprite {
    constructor(texture = null) {
        // Datos visuales (metadatos, NO objetos gráficos)
        this.textureId = null;  // ID de textura (string o número)
        this.texture = texture; // Textura del backend
        this.visible = true;
        this.zIndex = 0;
        
        // Información de animación/frames
        this.frameId = 0;       // Índice de frame actual
        
        // Propiedades de transformación visual
        this.flipX = false;
        this.flipY = false;
        this.anchorX = 0.5;
        this.anchorY = 0.5;
        
        // NO GUARDAR AQUÍ: sprite, pixiSprite, cualquier objeto gráfico
    }
}