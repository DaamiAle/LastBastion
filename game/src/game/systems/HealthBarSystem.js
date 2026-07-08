import { System } from '../../engine/ecs/System.js';
import { Health } from '../components/Health.js';
import { SpriteComponent } from '../components/SpriteComponent.js';
import { Container, Sprite } from 'pixi.js';

/**
 * Handles rendering of dynamic health bars floating above entities.
 */
export class HealthBarSystem extends System {
    /**
     * @param {Object} world The ECS World
     * @param {Object} sceneManager Reference to the SceneManager
     */
    constructor(world, sceneManager) {
        super(world);
        this.sceneManager = sceneManager;
    }

    update() {
        const scene = this.sceneManager.currentScene;
        if (!scene) return;

        const entities = this.world.getEntitiesWith(Health, SpriteComponent);

        for (const entityId of entities) {
            const health = this.world.getComponent(entityId, Health);
            const spriteComp = this.world.getComponent(entityId, SpriteComponent);

            if (!spriteComp.container) continue;

            if (!spriteComp.healthBarContainer) {
                const bgTexture = scene.game.assets.healthBarBgTexture;
                const fillTexture = scene.game.assets.healthBarFillTexture;
                
                if (!bgTexture || !fillTexture) continue;

                spriteComp.healthBarContainer = new Container();
                spriteComp.healthBarContainer.y = -30;

                spriteComp.healthBarBg = new Sprite(bgTexture);
                spriteComp.healthBarBg.anchor.set(0.5);
                spriteComp.healthBarBg.width = 34;
                spriteComp.healthBarBg.height = 8;

                spriteComp.healthBarFill = new Sprite(fillTexture);
                spriteComp.healthBarFill.anchor.set(0, 0.5);
                spriteComp.healthBarFill.x = -15;
                spriteComp.healthBarFillFullWidth = 30;
                spriteComp.healthBarFill.width = 30;
                spriteComp.healthBarFill.height = 4;

                spriteComp.healthBarContainer.addChild(spriteComp.healthBarBg);
                spriteComp.healthBarContainer.addChild(spriteComp.healthBarFill);
                spriteComp.container.addChild(spriteComp.healthBarContainer);
            }

            spriteComp.healthBarContainer.visible = health.hp < health.maxHp;
            const ratio = health.hp / health.maxHp;
            spriteComp.healthBarFill.width = Math.max(0, spriteComp.healthBarFillFullWidth * ratio);
        }
    }
}
