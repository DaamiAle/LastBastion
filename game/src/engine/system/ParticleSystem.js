import { Transform } from '../world/components/Transform.js';
import { ParticleEmitter } from '../world/components/ParticleEmitter.js';

/**
 * ParticleSystem
 * 
 * Gestiona el ciclo de vida, la física y el renderizado de partículas.
 * Implementa pooling de sprites PixiJS a través de IRenderBackend para máxima performance.
 */
export class ParticleSystem {
    /**
     * @param {IRenderBackend} renderBackend 
     */
    constructor(renderBackend) {
        this.backend = renderBackend;
        
        // Pool de handles de sprites libres para reutilizar
        this.pool = [];
        
        this.query = null;
    }

    /**
     * Actualiza y sincroniza las partículas
     */
    update(entities, time, scene = null) {
        const dt = (time && typeof time === 'object') ? time.deltaTime : time;

        if (scene && !this.query) {
            this.query = scene.query([Transform, ParticleEmitter]);
        }

        const emitters = this.query ? this.query.entities : entities;

        for (const entity of emitters) {
            const transform = entity.get(Transform);
            const emitter = entity.get(ParticleEmitter);

            if (!transform || !emitter) continue;

            // ===========================
            // 1. GENERACIÓN DE PARTÍCULAS
            // ===========================
            if (emitter.active) {
                emitter.spawnTimer += dt;
                const interval = 1 / emitter.rate;

                // Limitar la cantidad máxima de partículas creadas en un solo frame para evitar lag
                let spawnedCount = 0;
                while (emitter.spawnTimer >= interval && spawnedCount < 10) {
                    emitter.spawnTimer -= interval;
                    this._spawnParticle(transform.position.x, transform.position.y, emitter);
                    spawnedCount++;
                }
            }

            // Emitir ráfagas instantáneas (bursts)
            while (emitter.burstCount > 0) {
                this._spawnParticle(transform.position.x, transform.position.y, emitter);
                emitter.burstCount--;
            }

            // ===========================
            // 2. ACTUALIZACIÓN Y RENDER
            // ===========================
            for (let i = emitter.particles.length - 1; i >= 0; i--) {
                const p = emitter.particles[i];
                p.age += dt;

                if (p.age >= p.lifetime) {
                    // La partícula ha muerto: apagar visibilidad y devolver al pool
                    this.backend.setVisible(p.handle, false);
                    this.pool.push(p.handle);
                    emitter.particles.splice(i, 1);
                } else {
                    // Física: aplicar velocidad y gravedad
                    p.vx += emitter.gravityX * dt;
                    p.vy += emitter.gravityY * dt;
                    p.x += p.vx * dt;
                    p.y += p.vy * dt;

                    // Interpolaciones temporales (age)
                    const t = p.age / p.lifetime;
                    const size = p.sizeStart + (p.sizeEnd - p.sizeStart) * t;
                    const alpha = p.alphaStart + (p.alphaEnd - p.alphaStart) * t;

                    // Escala base: asumimos textura por defecto blanca de 16x16px
                    const scale = size / 16;

                    // Sincronizar con backend de render
                    this.backend.setPosition(p.handle, p.x, p.y);
                    this.backend.setScale(p.handle, scale, scale);
                    this.backend.setAlpha(p.handle, alpha);
                }
            }
        }
    }

    /**
     * Spawnea una partícula individual
     */
    _spawnParticle(x, y, emitter) {
        // Calcular parámetros aleatorios
        const lifetime = emitter.lifetimeMin + Math.random() * (emitter.lifetimeMax - emitter.lifetimeMin);
        const speed = emitter.speedMin + Math.random() * (emitter.speedMax - emitter.speedMin);
        const angle = (emitter.angle - emitter.spread / 2) + Math.random() * emitter.spread;

        const vx = Math.cos(angle) * speed;
        const vy = Math.sin(angle) * speed;

        // Obtener sprite del pool o crear uno nuevo
        let handle = this.pool.pop();
        if (!handle) {
            handle = this.backend.createSprite();
        }

        // Configuración inicial del render handle
        this.backend.setTexture(handle, emitter.texture);
        this.backend.setTint(handle, emitter.color);
        this.backend.setAnchor(handle, 0.5, 0.5);
        this.backend.setZIndex(handle, 10); // Partículas por encima de los personajes
        this.backend.setVisible(handle, true);

        // Crear objeto de datos liviano
        const particle = {
            x,
            y,
            vx,
            vy,
            age: 0,
            lifetime,
            sizeStart: emitter.sizeStart,
            sizeEnd: emitter.sizeEnd,
            alphaStart: emitter.alphaStart,
            alphaEnd: emitter.alphaEnd,
            handle
        };

        emitter.particles.push(particle);
    }

    /**
     * Limpieza de recursos al destruir el sistema
     */
    destroy() {
        // Destruir todas las partículas del pool
        for (const handle of this.pool) {
            if (handle.isValid()) {
                this.backend.destroySprite(handle);
            }
        }
        this.pool = [];
        this.query = null;
    }
}
