// src/game/entities/PlayerFactory.js

import { Entity } from '../../engine/world/Entity.js';
import { Transform } from '../../engine/world/components/Transform.js';
import { Velocity } from '../../engine/world/components/Velocity.js';
import { Acceleration } from '../../engine/world/components/Acceleration.js';
import { Sprite } from '../../engine/world/components/Sprite.js';
import { Animation } from '../../engine/world/components/Animation.js';
import { Input } from '../../engine/world/components/Input.js';
import { CircleCollider } from '../../engine/world/components/colliders/CircleCollider.js';
import { Player } from '../components/Player.js';

export class PlayerFactory {
    /**
     * Crear el player principal
     * @param {Object} config
     * @param {import('../../engine/utils/spriteFrames.js').SpriteFrames[]} config.walkFrames
     * @param {import('../../engine/utils/spriteFrames.js').SpriteFrames[]} config.idleFrames
     * @param {*} config.texture
     * @param {{x:number,y:number}} config.position
     * @param {number} config.scale
     * @returns {Entity}
     */
    static create({ walkFrames = [], idleFrames = [], texture = null, position = { x: 0, y: 0 }, scale = 0.5 }) {
        const spriteTexture = idleFrames.length > 0 ? idleFrames[0].texture : texture;

        const player = new Entity()
            .add(new Transform())
            .add(new Velocity(0, 0, { faceMovement: true }))
            .add(new Acceleration({
                maxSpeed: 150,
                accel: 800,
                decel: 1200
            }))
            .add(new Sprite(spriteTexture))
            .add(new Animation({
                walk: {
                    frames: walkFrames,
                    frameDuration: 0.03,
                    loop: true
                },
                idle: {
                    frames: idleFrames,
                    frameDuration: 1,
                    loop: false
                }
            }))
            .add(new Input())
            .add(new CircleCollider(20, { layer: 'player' }))
            .add(new Player());

        const transform = player.get(Transform);
        transform.scale.set(scale, scale);
        transform.setPosition(position.x, position.y);

        player.get(Animation).play('idle');

        return player;
    }
}
