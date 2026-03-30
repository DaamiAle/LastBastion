import './index.css';
import { Game } from './engine/Game.js';
import { GameScene } from './game/GameScene.js';

(async () => {
    const game = new Game();
    await game.init();

    game.sceneManager.change(new GameScene(game));
})();