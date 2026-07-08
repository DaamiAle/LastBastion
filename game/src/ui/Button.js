import { Container, Graphics, Text } from 'pixi.js';

/**
 * Botón de interfaz de usuario genérico y reutilizable.
 */
export class Button extends Container {
    /**
     * @param {Object} options Objeto de opciones
     * @param {string} options.text Texto de la etiqueta
     * @param {number} [options.width=300] Ancho del botón
     * @param {number} [options.height=50] Alto del botón
     * @param {Function} options.onClick Función a ejecutar al hacer clic
     */
    constructor({ text, width = 300, height = 50, onClick }) {
        super();

        this.onClick = onClick;

        // Background
        this.bg = new Graphics()
            .rect(-width / 2, -height / 2, width, height)
            .fill(0x333333);

        // Label
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

        // Interactivity
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