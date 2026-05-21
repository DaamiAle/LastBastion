//src/main.js
import './index.css';
import { Runtime } from './engine/core/Runtime.js';
import { SceneFactory } from './game/utils/SceneFactory.js';
import { TopDownBase } from './game/base/TopDownBase.js';
import { TestScene } from './game/scenes/TestScene.js';

async function start() {
    const runtime = new Runtime();
    await runtime.init();

    // 👇 Crear escena usando SceneFactory con TopDownBase
    // TopDownBase se encarga de registrar todos los sistemas en el orden correcto
    const scene = await SceneFactory.createScene(TopDownBase, runtime, TestScene);
    await runtime.sceneManager.change(scene);

    // 👇 botones
    document.getElementById('pause').onclick = () => {
        runtime.time.setScale(0);
    };

    document.getElementById('resume').onclick = () => {
        runtime.time.setScale(1);
    };

    document.getElementById('slow').onclick = () => {
        runtime.time.setScale(0.2);
    };

    document.getElementById('fast').onclick = () => {
        runtime.time.setScale(2);
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

*/