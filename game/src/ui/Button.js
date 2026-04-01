import { Container, Graphics, Text } from 'pixi.js';

export class Button extends Container {
    constructor({ text, width = 300, height = 50, onClick }) {
        super();

        this.onClick = onClick;

        // fondo
        this.bg = new Graphics()
            .rect(-width / 2, -height / 2, width, height)
            .fill(0x333333);

        // texto
        this.label = new Text({
            text,
            style: {
                fill: 0xffffff,
                fontSize: 24
            }
        });

        this.label.anchor.set(0.5);

        this.addChild(this.bg);
        this.addChild(this.label);

        // interacción
        this.eventMode = 'static';
        this.cursor = 'pointer';

        this.on('pointerover', () => {
            this.bg.tint = 0x555555;
        });

        this.on('pointerout', () => {
            this.bg.tint = 0xffffff;
        });

        this.on('pointerdown', () => {
            if (this.onClick) this.onClick();
        });
    }
}