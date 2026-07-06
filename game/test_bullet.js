import { World } from './src/engine/ecs/World.js';
import { assembleBullet } from './src/game/assemblers/BulletAssembler.js';
import { ProjectileComponent } from './src/game/components/ProjectileComponent.js';

const scene = {
    game: {
        world: new World()
    },
    container: {
        addChild: () => {}
    }
};

const id = assembleBullet(scene, 0, 0, 1, 0, {});
const hasProj = scene.game.world.hasComponent(id, ProjectileComponent);
console.log("Has ProjectileComponent:", hasProj);
