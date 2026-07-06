import { World } from './src/engine/ecs/World.js';
import { CollisionSystem } from './src/game/systems/CollisionSystem.js';
import { CombatSystem } from './src/game/systems/CombatSystem.js';
import { Transform } from './src/game/components/Transform.js';
import { ProjectileComponent } from './src/game/components/ProjectileComponent.js';
import { ZombieAIComponent } from './src/game/components/ZombieAIComponent.js';
import { Health } from './src/game/components/Health.js';

const world = new World();
const sceneManager = {
    currentScene: {
        addEntity: () => {}
    }
};
world.addSystem(new CollisionSystem(world, sceneManager));
world.addSystem(new CombatSystem(world, sceneManager));

const zombieId = world.createEntity();
world.addComponent(zombieId, new Transform(100, 100));
const zAi = new ZombieAIComponent({});
zAi.radius = 12;
world.addComponent(zombieId, zAi);
world.addComponent(zombieId, new Health(100));

for (let i = 0; i < 4; i++) {
    const projId = world.createEntity();
    world.addComponent(projId, new Transform(100, 100));
    world.addComponent(projId, new ProjectileComponent(100, 100, 25, 500, 0));
    world.update({ deltaMS: 16 });
}

console.log("After update:");
console.log("Projectiles:", world.getEntitiesWith(Transform, ProjectileComponent).length);
console.log("Zombies:", world.getEntitiesWith(Transform, ZombieAIComponent, Health).length);
