import { System } from '../../engine/ecs/System.js';
import { Transform } from '../components/Transform.js';
import { SpriteComponent } from '../components/SpriteComponent.js';

export class RenderSystem extends System {
    update(delta) {
        const entities = this.world.getEntitiesWith(Transform, SpriteComponent);
        for (const entityId of entities) {
            const transform = this.world.getComponent(entityId, Transform);
            const spriteComp = this.world.getComponent(entityId, SpriteComponent);
            
            if (spriteComp.container) {
                spriteComp.container.x = transform.x;
                spriteComp.container.y = transform.y;
                spriteComp.container.rotation = transform.rotation;
            }
        }
    }
}
