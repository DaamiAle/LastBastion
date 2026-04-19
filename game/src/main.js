import './index.css';
import { Runtime } from './engine/core/Runtime';

async function start() {
    const game = new Runtime();
    await game.init();

    // 👇 botones
    document.getElementById('pause').onclick = () => {
        game.time.setScale(0);
    };

    document.getElementById('resume').onclick = () => {
        game.time.setScale(1);
    };

    document.getElementById('slow').onclick = () => {
        game.time.setScale(0.2);
    };

    document.getElementById('fast').onclick = () => {
        game.time.setScale(2);
    };
}

start();

//// Carga de assets
//await Assets.load('/assets/zombie.png'); // Textura del zombie
//await Assets.load('/assets/player.png'); // Textura del jugador
//await Assets.load('/assets/fortress.png'); // Textura de la fortaleza

/*
src/
  engine/
    core/
      Game.js
      Time.js
      Config.js

    ecs/                     (opcional, si evolucionás a ECS)
      Entity.js
      Component.js
      System.js
      World.js

    systems/
      CollisionSystem.js
      RenderSystem.js
      PhysicsSystem.js

    scene/
      Scene.js
      SceneManager.js
      SceneStack.js
      SceneTransition.js

    input/
      Input.js
      Keyboard.js
      Mouse.js
      Gamepad.js
      InputMapper.js

    assets/
      AssetLoader.js
      AssetCache.js
      AssetManifest.js

    rendering/
      Renderer.js
      SpriteRenderer.js
      Camera.js

    behavior/
      fsm/
        FSM.js
        State.js
        Transition.js
      bt/                    (si agregás behavior trees)
        BehaviorTree.js
        Node.js

    math/
      Vector2.js
      Rectangle.js
      Circle.js

    utils/
      EventEmitter.js
      Logger.js
      Pool.js

  game/
    assets/
      manifest.js

    entities/
    components/              (si usás ECS)
    systems/
    scenes/
    states/
    ui/

  main.js

*/