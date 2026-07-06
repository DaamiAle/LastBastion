import { World } from './src/engine/ecs/World.js';
import { MovementSystem } from './src/game/systems/MovementSystem.js';
import { CollisionSystem } from './src/game/systems/CollisionSystem.js';
import { CombatSystem } from './src/game/systems/CombatSystem.js';
import { Transform } from './src/game/components/Transform.js';
import { Velocity } from './src/game/components/Velocity.js';
import { ProjectileComponent } from './src/game/components/ProjectileComponent.js';
import { ZombieAIComponent } from './src/game/components/ZombieAIComponent.js';
import { Health } from './src/game/components/Health.js';

const world = new World();
const sceneManager = { currentScene: { addEntity: () => {}, emitNoise: () => {} } };
world.addSystem(new MovementSystem(world, sceneManager));
world.addSystem(new CollisionSystem(world, sceneManager));
world.addSystem(new CombatSystem(world, sceneManager));

const zombieId = world.createEntity();
world.addComponent(zombieId, new Transform(100, 100));
const zAi = new ZombieAIComponent({});
zAi.radius = 14;
world.addComponent(zombieId, zAi);
world.addComponent(zombieId, new Health(100));

const projId = world.createEntity();
world.addComponent(projId, new Transform(50, 100));
world.addComponent(projId, new Velocity(1, 0, 920));
world.addComponent(projId, new ProjectileComponent(50, 100, 24, 500, 0));

for (let i = 0; i < 5; i++) {
    console.log(`--- Frame ${i} ---`);
    const zT = world.getComponent(zombieId, Transform);
    const pT = world.getComponent(projId, Transform);
    console.log(`Before update: Zombie X=${zT?.x.toFixed(2)}, Proj X=${pT?.x.toFixed(2)}`);
    world.update({ deltaMS: 16.666 });
    console.log(`After update: Zombie X=${zT?.x.toFixed(2)}, Proj X=${pT?.x.toFixed(2)}, Proj Exists: ${world.hasComponent(projId, Transform)}`);
}
