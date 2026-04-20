// game/scenes/TestScene.js

import { Scene } from '../../engine/scene/Scene.js';

import { MovementSystem } from '../../engine/system/MovementSystem.js';
import { RenderSystem } from '../../engine/system/RenderSystem.js';
import { CollisionSystem } from '../../engine/system/CollisionSystem.js';

import { collisionMatrix } from '../config/collisionMatrix.js';

import { Entity } from '../../engine/world/Entity.js';
import { Transform } from '../../engine/world/components/Transform.js';
import { Velocity } from '../../engine/world/components/Velocity.js';
import { Sprite } from '../../engine/world/components/Sprite.js';
import { CircleCollider } from '../../engine/world/components/colliders/CircleCollider.js';

import { Assets } from 'pixi.js';

export class TestScene extends Scene {
    async onEnter(runtime) {
        // =========================
        // SYSTEMS
        // =========================
        this.addSystem(new MovementSystem());
        this.addSystem(new CollisionSystem(collisionMatrix, this.grid));
        this.addSystem(new RenderSystem(runtime.app.stage));

        // =========================
        // ASSETS
        // =========================

        const width = runtime.app.renderer.width;
        const height = runtime.app.renderer.height;

        // PLAYER (izquierda)
        let texture = await Assets.load('/assets/player.png');
        const player = new Entity()
            .add(new Transform())
            .add(new Velocity(100, 0))
            .add(new Sprite(texture))
            .add(new CircleCollider(20, { layer: 'player' }));
        player.get(Transform).setPosition(width * 0.25, height * 0.5);
        player.get(Transform).scale.set(1, 1);

        player.hp = 100;

        this.addEntity(player);

        // ENEMY (derecha)
        texture = await Assets.load('/assets/zombie.png');
        const enemy = new Entity()
            .add(new Transform())
            .add(new Velocity(-100, 0))
            .add(new Sprite(texture))
            .add(new CircleCollider(20, { layer: 'enemy' }));
        enemy.get(Transform).setPosition(width * 0.75, height * 0.5);
        enemy.get(Transform).scale.set(1.25,1.25);
        enemy.hp = 50;

        this.addEntity(enemy);


    }
}