// src/game/scenes/TestScene.js

import { Scene } from '../../engine/scene/Scene.js';
import { SpriteSheetMeta } from '../../engine/assets/SpriteSheetMeta.js';

import { Entity } from '../../engine/world/Entity.js';
import { Transform } from '../../engine/world/components/Transform.js';
import { Velocity } from '../../engine/world/components/Velocity.js';
import { Sprite } from '../../engine/world/components/Sprite.js';
import { CircleCollider } from '../../engine/world/components/colliders/CircleCollider.js';
import { PlayerFactory } from '../entities/PlayerFactory.js';

import { createFramesFromMeta } from '../../engine/utils/spriteFrames.js';

// Nuevos componentes y tipos del engine/gameplay
import { ParticleEmitter } from '../../engine/world/components/ParticleEmitter.js';
import { Boid } from '../../gameplay/components/Boid.js';
import { Player } from '../components/Player.js';
import { CollisionEvents } from '../../engine/events/EventTypes.js';

/**
 * TestScene
 * Escena de prueba usando TopDownBase.
 * Los sistemas ya están registrados por TopDownBase.registerSystems().
 */
export class TestScene extends Scene {
    async onEnter(runtime, gameConfig) {
        this.runtime = runtime;
        this.stepTimer = 0;
        this.growlTimer = 0;

        const width = runtime.app.renderer.width;
        const height = runtime.app.renderer.height;

        // =========================
        // LOAD ASSETS
        // =========================
        const texture = await runtime.assets.load('player_texture', '/assets/Walk_player.png');
        const metaText = await fetch('/assets/Walk_player.png.meta').then(r => r.text());
        const meta = new SpriteSheetMeta(metaText);

        // =========================
        // CREATE FRAMES
        // =========================
        const walkFrames = createFramesFromMeta(texture, meta.sprites);
        const idleFrames = createFramesFromMeta(texture, meta.sprites.slice(0, 1));

        // =========================
        // PLAYER
        // =========================
        const player = PlayerFactory.create({
            walkFrames,
            idleFrames,
            texture,
            position: { x: width * 0.5, y: height * 0.5 },
            scale: 0.5
        });

        // Añadir emisor de partículas para la estela de polvo al caminar
        player.add(new ParticleEmitter({
            rate: 22,
            lifetimeMin: 0.2,
            lifetimeMax: 0.4,
            speedMin: 20,
            speedMax: 50,
            spread: Math.PI / 4,
            sizeStart: 7,
            sizeEnd: 1,
            alphaStart: 0.5,
            alphaEnd: 0.0,
            color: 0xddccbb,
            active: false
        }));

        this.player = player;
        this.addEntity(player);

        // =========================
        // ENEMIES (mass spawn zombies con inteligencia Boid)
        // =========================
        const enemyTexture = await runtime.assets.load(
            'enemy_texture',
            '/assets/zombie.png'
        );

        // 1500 enemigos activos concurrentemente
        const ENEMY_COUNT = 1500;

        for (let i = 0; i < ENEMY_COUNT; i++) {
            const vx = (Math.random() * 200 - 100);
            const vy = (Math.random() * 200 - 100);

            const enemy = new Entity()
                .add(new Transform())
                .add(new Velocity(vx, vy, { faceMovement: true }))
                .add(new Sprite(enemyTexture))
                // Círculo colisor levemente reducido a 12px para mayor fluidez en hordas masivas
                .add(new CircleCollider(12, { layer: 'enemy' }))
                // Inteligencia de Flocking y Steering de Reynolds
                .add(new Boid({
                    maxSpeed: 45 + Math.random() * 25, // Más lentos que el player para ser esquivables
                    maxForce: 75 + Math.random() * 30, // Fuerza de giro
                    perceptionRadius: 55,
                    separationWeight: 3.5, // Fuerte separación para que se mantengan separados realistamente
                    alignmentWeight: 0.4,
                    cohesionWeight: 0.3,
                    seekWeight: 1.2, // Fuerza de persecución al jugador
                    targetEntity: player
                }));

            enemy.get(Transform).setPosition(Math.random() * width, Math.random() * height);
            enemy.get(Transform).scale.set(0.5, 0.5);

            this.addEntity(enemy);
        }

        // =========================
        // COLLISION FX TRIGGERS
        // =========================
        this.eventBus.on(CollisionEvents.ENTER, ({ entityA, entityB }) => {
            const isPlayerA = entityA.has(Player);
            const isPlayerB = entityB.has(Player);

            if (isPlayerA || isPlayerB) {
                const p = isPlayerA ? entityA : entityB;

                // 1. Play hit synth sound (impacto sordo de baja frecuencia)
                this.runtime.audio.playSynth('hit', { frequency: 95, duration: 0.16, volume: 0.15 });

                // 2. Disparar ráfaga de sangre en la posición del jugador
                const emitter = p.get(ParticleEmitter);
                if (emitter) {
                    emitter.color = 0xff3333; // Burst rojo sangre
                    emitter.burst(16);
                }
            }
        });
    }

    update(time) {
        super.update(time);
        const dt = (time && typeof time === 'object') ? time.deltaTime : time;

        if (this.player && this.player.active) {
            const vel = this.player.get(Velocity);
            const speed = Math.hypot(vel.x, vel.y);
            const emitter = this.player.get(ParticleEmitter);

            if (speed > 10) {
                // Sincronizar dirección del emisor de polvo (opuesto al movimiento)
                if (emitter) {
                    emitter.active = true;
                    // Tono de polvo
                    emitter.color = 0xddccbb;
                    emitter.angle = Math.atan2(vel.y, vel.x) + Math.PI; 
                }

                // Temporizador de sonido de pasos (steps)
                this.stepTimer += dt;
                if (this.stepTimer >= 0.28) {
                    this.stepTimer = 0;
                    this.runtime.audio.playSynth('step', { 
                        frequency: 110 + Math.random() * 30, 
                        duration: 0.06, 
                        volume: 0.04 
                    });
                }
            } else {
                if (emitter) {
                    emitter.active = false;
                }
            }
        }

        // Gruñidos aleatorios de la horda zombie de vez en cuando
        this.growlTimer += dt;
        if (this.growlTimer >= 4.5) {
            this.growlTimer = 0;
            this.runtime.audio.playSynth('growl', { 
                frequency: 65 + Math.random() * 25, 
                duration: 0.45, 
                volume: 0.06 
            });
        }
    }
}