import { Container, Sprite, Graphics } from 'pixi.js';
import { Transform } from '../components/Transform.js';
import { Velocity } from '../components/Velocity.js';
import { Health } from '../components/Health.js';
import { BoidComponent } from '../components/BoidComponent.js';
import { SpriteComponent } from '../components/SpriteComponent.js';
import { ZombieAIComponent } from '../components/ZombieAIComponent.js';
import { FSM } from '../../engine/core/FSM.js';
import { IdleState } from '../states/IdleState.js';

export function assembleZombie(scene, x, y) {
    const world = scene.game.world;
    const config = scene.game.config.zombies;
    const entityId = world.createEntity();

    // 1. Transform
    world.addComponent(entityId, new Transform(x, y));

    // 2. Velocity
    const angle = Math.random() * Math.PI * 2;
    const speed = config.minSpeed + Math.random() * (config.maxSpeed - config.minSpeed);
    world.addComponent(entityId, new Velocity(Math.cos(angle), Math.sin(angle), speed));

    // 3. Health
    world.addComponent(entityId, new Health(config.maxHealth));

    // 4. Boids
    world.addComponent(entityId, new BoidComponent(
        config.flockRadius,
        config.separationWeight,
        config.alignmentWeight,
        config.cohesionWeight,
        config.seekWeight
    ));

    // 5. Visual / Sprite
    const container = new Container();
    container.x = x;
    container.y = y;
    container.zIndex = 2;

    const texture = scene.game.assets.zombieTexture;
    let sprite;
    if (texture) {
        sprite = new Sprite(texture);
        sprite.anchor.set(0.5);
        sprite.scale.set(config.spriteScale);
        container.addChild(sprite);
    } else {
        sprite = new Graphics()
            .circle(0, 0, config.radius)
            .fill(0x9ae6b4)
            .stroke({ color: 0x14532d, width: 2 });
        container.addChild(sprite);
    }
    
    // We can add healthbar logic here if we create a HealthBar component.
    // For now we add the container to the scene.
    scene.container.addChild(container);

    const spriteComp = new SpriteComponent(container);
    world.addComponent(entityId, spriteComp);

    // 6. AI & FSM
    // We pass the entityId to the FSM as its owner
    const fsm = new FSM(entityId);
    
    // Initialize AI Component with data needed by states
    const aiComp = new ZombieAIComponent(fsm);
    aiComp.scene = scene; // Temp injection for grid queries
    aiComp.target = null;
    aiComp.targetPoint = null;
    aiComp.lastHeardNoiseId = null;
    aiComp.attackRange = config.attackRange;
    aiComp.attackCooldown = config.attackCooldownMs;
    aiComp.attackTimer = 0;
    aiComp.damage = config.damage;
    aiComp.radius = config.radius; // physical radius
    world.addComponent(entityId, aiComp);
    
    fsm.change(new IdleState(entityId, scene.game.world));

    // Also add to grid for collisions (temporarily still needed by scene)
    scene.grid.insert(entityId, x, y);

    return entityId;
}
