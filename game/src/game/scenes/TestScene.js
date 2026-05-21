// src/game/scenes/TestScene.js

import { Scene } from '../../engine/scene/Scene.js';
import { SpriteSheetMeta } from '../../engine/assets/SpriteSheetMeta.js';

import { Entity } from '../../engine/world/Entity.js';
import { Transform } from '../../engine/world/components/Transform.js';
import { Velocity } from '../../engine/world/components/Velocity.js';
import { Acceleration } from '../../engine/world/components/Acceleration.js';
import { Sprite } from '../../engine/world/components/Sprite.js';
import { Animation } from '../../engine/world/components/Animation.js';
import { Input } from '../../engine/world/components/Input.js';
import { CircleCollider } from '../../engine/world/components/colliders/CircleCollider.js';
import { PlayerFactory } from '../entities/PlayerFactory.js';

import { createFramesFromMeta } from '../../engine/utils/spriteFrames.js';

/**
 * TestScene
 * Escena de prueba usando TopDownBase (definida en main.js).
 * Los sistemas ya están registrados por TopDownBase.registerSystems().
 * Esta escena solo se ocupa de cargar assets y crear entidades.
 */
export class TestScene extends Scene {
    async onEnter(runtime, gameConfig) {
        // gameConfig viene de TopDownBase, registrada por SceneFactory

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

        this.addEntity(player);

        // =========================
        // ENEMIES (mass spawn zombies)
        // =========================
        const enemyTexture = await runtime.assets.load(
            'enemy_texture',
            '/assets/zombie.png'
        );

        const ENEMY_COUNT = 1500;

        for (let i = 0; i < ENEMY_COUNT; i++) {
            const vx = (Math.random() * 200 - 100);
            const vy = (Math.random() * 200 - 100);

            const enemy = new Entity()
                .add(new Transform())
                .add(new Velocity(vx, vy, { faceMovement: true }))
                .add(new Sprite(enemyTexture))
                .add(new CircleCollider(16, { layer: 'enemy' }));

            enemy.get(Transform).setPosition(Math.random() * width, Math.random() * height);
            enemy.get(Transform).scale.set(0.5, 0.5);

            this.addEntity(enemy);
        }
    }
}