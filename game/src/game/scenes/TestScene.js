import { Scene } from '../../engine/scene/Scene.js';
import { Entity } from '../../engine/world/Entity.js';
import { Transform } from '../../engine/world/components/Transform.js';
import { Velocity } from '../../engine/world/components/Velocity.js';
import { Sprite } from '../../engine/world/components/Sprite.js';
import { MovementSystem } from '../../engine/system/MovementSystem.js';
import { RenderSystem } from '../../engine/system/RenderSystem.js';
import { Assets } from 'pixi.js';

export class TestScene extends Scene {
    async start() {
        const texture = await Assets.load('/assets/player.png');

        // systems
        this.addSystem(new MovementSystem());
        this.addSystem(new RenderSystem(this.runtime.app.stage));

        // entidad de test
        const e = new Entity()
            .add(new Transform())
            .add(new Velocity(100, 0))
            .add(new Sprite(texture));

        this.addEntity(e);
    }
}