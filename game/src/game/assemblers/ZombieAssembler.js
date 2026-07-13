import { Container, Sprite, Graphics } from 'pixi.js';
import { Transform } from '../components/Transform.js';
import { Velocity } from '../components/Velocity.js';
import { Health } from '../components/Health.js';
import { BoidComponent } from '../components/BoidComponent.js';
import { SpriteComponent } from '../components/SpriteComponent.js';
import { ZombieAIComponent } from '../components/ZombieAIComponent.js';
import { FSM } from '../../engine/core/FSM.js';
import { IdleState } from '../states/IdleState.js';

/**
 * Genera una entidad ECS zombie y configura sus componentes físicos y de combate.
 * @param {Object} scene La escena activa del juego
 * @param {number} x Coordenada de aparición X en el mundo
 * @param {number} y Coordenada de aparición Y en el mundo
 * @returns {number} El ID de la entidad ECS del zombie
 */
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

    // 4. Boids (Bandada)
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
        sprite.rotation = config.aimRotationOffset;
        container.addChild(sprite);
    } else {
        sprite = new Graphics()
            .circle(0, 0, config.radius)
            .fill(0x9ae6b4)
            .stroke({ color: 0x14532d, width: 2 });
        container.addChild(sprite);
    }
    
    // Podemos añadir la lógica de la barra de vida aquí si creamos un componente HealthBar.
    // Por ahora añadimos el contenedor a la escena.
    scene.container.addChild(container);

    const spriteComp = new SpriteComponent(container);
    world.addComponent(entityId, spriteComp);

    // 6. IA y Máquina de Estados Finitos (FSM)
    // Pasamos el entityId a la FSM como su propietario
    const fsm = new FSM(entityId);
    
    // Inicializar componente IA con los datos que necesitan los estados
    const aiComp = new ZombieAIComponent(fsm);
    aiComp.scene = scene; // Inyección temporal para consultas a la grilla (grid)
    aiComp.target = null;
    aiComp.targetPoint = null;
    aiComp.lastHeardNoiseId = null;
    aiComp.attackRange = config.attackRange;
    aiComp.attackCooldown = config.attackCooldownMs;
    aiComp.attackTimer = 0;
    aiComp.damage = config.damage;
    // El hitbox lógico ahora se adapta exactamente al tamaño visual final en pantalla
    aiComp.radius = sprite ? sprite.width / 2 : config.radius; 
    aiComp.detectionRadius = config.detectionRadius;
    aiComp.wanderTimer = 0;
    aiComp.wanderAngle = Math.random() * Math.PI * 2;
    world.addComponent(entityId, aiComp);
    
    fsm.change(new IdleState(entityId, scene.game.world));

    // También añadir a la grilla para las colisiones (temporalmente aún lo necesita la escena)
    scene.grid.insert(entityId, x, y);

    return entityId;
}
