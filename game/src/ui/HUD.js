import { Container, Text } from 'pixi.js';

export class HUD {
    constructor(game) {
        this.game = game;
        this.container = new Container();

        this.text = new Text({
            text: "HP: 100",
            style: {
                fill: 0xffffff,
                fontSize: 20
            }
        });

        this.text.x = 10;
        this.text.y = 10;

        this.container.addChild(this.text);
    }

    update(data) {
        // después lo conectamos a datos reales
        /*
        data = {
            fortressHp: this.fortress.hp,
            playerHp: this.player.hp,
            zombies: this.entities.filter(e => e.type === "zombie").length
        };
        
        */
        this.text.text = `Fortress HP: ${data.fortressHp} | Player HP: ${data.playerHp} | Zombies: ${data.zombies}`;
    }

}