import './index.css';
import { Game } from './engine/Game.js';
import { MainMenuScene } from './game/scenes/MainMenuScene.js';

(async () => {
    const game = new Game();
    await game.init();

    game.sceneManager.change(new MainMenuScene(game));
})();