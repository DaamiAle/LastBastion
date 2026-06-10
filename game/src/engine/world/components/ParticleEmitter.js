/**
 * ParticleEmitter Component
 * 
 * Configura y almacena el estado de un emisor de partículas.
 * Sigue los principios ECS conteniendo solo datos de configuración y estado de partículas.
 */
export class ParticleEmitter {
    constructor(config = {}) {
        // Configuración de emisión
        this.rate = config.rate ?? 30;             // Partículas por segundo
        this.lifetimeMin = config.lifetimeMin ?? 0.3; // Tiempo de vida mínimo (segundos)
        this.lifetimeMax = config.lifetimeMax ?? 0.8; // Tiempo de vida máximo (segundos)
        
        this.speedMin = config.speedMin ?? 40;       // Velocidad inicial mínima (px/s)
        this.speedMax = config.speedMax ?? 90;       // Velocidad inicial máxima (px/s)
        
        this.angle = config.angle ?? 0;              // Dirección base (radianes)
        this.spread = config.spread ?? (Math.PI * 2); // Ángulo de dispersión (radianes)
        
        this.gravityX = config.gravityX ?? 0;        // Aceleración de gravedad X (px/s²)
        this.gravityY = config.gravityY ?? 0;        // Aceleración de gravedad Y (px/s²)
        
        this.sizeStart = config.sizeStart ?? 6;       // Tamaño inicial (px)
        this.sizeEnd = config.sizeEnd ?? 0;           // Tamaño final (px)
        
        this.alphaStart = config.alphaStart ?? 1.0;   // Opacidad inicial
        this.alphaEnd = config.alphaEnd ?? 0.0;       // Opacidad final
        
        this.color = config.color ?? 0xffffff;       // Color (tinte hexadecimal)
        
        this.active = config.active ?? true;         // Si está emitiendo activamente
        this.texture = config.texture ?? null;       // Textura opcional (sino, usa default blanca)
        
        // Disparar en ráfagas (burst)
        this.burstCount = 0;                         // Partículas a emitir de golpe
        
        // Estado interno
        this.spawnTimer = 0;
        this.particles = [];                         // Array de objetos de partículas
    }

    /**
     * Disparar una ráfaga inmediata de partículas
     * @param {number} count 
     */
    burst(count) {
        this.burstCount += count;
    }
}
