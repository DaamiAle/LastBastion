import { Container, Graphics, Sprite } from 'pixi.js';
import { Transform } from '../components/Transform.js';
import { Velocity } from '../components/Velocity.js';
import { SpriteComponent } from '../components/SpriteComponent.js';
import { ProjectileComponent } from '../components/ProjectileComponent.js';

/**
 * @param {Object} scene La escena activa
 * @param {number} x Coordenada X
 * @param {number} y Coordenada Y
 * @param {number} dirX Dirección X
 * @param {number} dirY Dirección Y
 * @param {Object} options Opciones del proyectil
 * @param {number} [options.splashRadius=0] Radio de área de efecto (0 = un solo objetivo)
 * @returns {number} El ID de la entidad ECS recién creada
 */
export function assembleBullet(scene, x, y, dirX, dirY, options = {}) {
    const world = scene.game.world;
    const entityId = world.createEntity();

    const speed = options.speed ?? 600;
    const damage = options.damage ?? 25;
    const size = options.size ?? 4;
    const color = options.color ?? 0xffff00;
    const texture = options.texture ?? null;
    const rotationOffset = options.rotationOffset ?? 0;
    const maxDistance = options.maxDistance ?? 512;
    const splashRadius = options.splashRadius ?? 0;

    world.addComponent(entityId, new Transform(x, y));
    world.addComponent(entityId, new Velocity(dirX, dirY, speed));

    const container = new Container();
    container.x = x;
    container.y = y;
    container.zIndex = 6;

    let graphics;
    let hitRadius = size;
    if (texture) {
        graphics = new Sprite(texture);
        graphics.anchor.set(0.5);
        graphics.scale.set(size > 4 ? 1.5 : 1);
        graphics.rotation = Math.atan2(dirY, dirX) + rotationOffset;
        hitRadius = graphics.width / 2;
    } else {
        graphics = new Graphics()
            .circle(0, 0, size)
            .fill(color);
    }

    world.addComponent(entityId, new ProjectileComponent(x, y, damage, maxDistance, splashRadius, hitRadius));

    container.addChild(graphics);
    scene.container.addChild(container);

    world.addComponent(entityId, new SpriteComponent(container));

    return entityId;
}
