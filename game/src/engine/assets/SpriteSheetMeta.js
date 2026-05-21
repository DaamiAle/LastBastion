// src/engine/assets/SpriteSheetMeta.js

export class SpriteSheetMeta {
    constructor(metaText) {
        this.sprites = this._parseSprites(metaText);
    }

    _parseSprites(text) {
        const lines = text.split('\n');

        const sprites = [];

        let inSprites = false;
        let current = null;
        let inRect = false;

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();

            // entrar en sprites
            if (line === 'sprites:') {
                inSprites = true;
                continue;
            }

            if (!inSprites) continue;

            // nuevo sprite
            if (line.startsWith('- serializedVersion')) {
                if (current) sprites.push(current);

                current = {
                    name: '',
                    rect: { x: 0, y: 0, width: 0, height: 0 },
                    pivot: { x: 0.5, y: 0.5 }
                };

                inRect = false;
                continue;
            }

            if (!current) continue;

            // nombre
            if (line.startsWith('name:')) {
                current.name = line.split(':')[1].trim();
                continue;
            }

            // rect
            if (line === 'rect:') {
                inRect = true;
                continue;
            }

            if (inRect) {
                if (line.startsWith('x:')) current.rect.x = Number(line.split(':')[1]);
                else if (line.startsWith('y:')) current.rect.y = Number(line.split(':')[1]);
                else if (line.startsWith('width:')) current.rect.width = Number(line.split(':')[1]);
                else if (line.startsWith('height:')) current.rect.height = Number(line.split(':')[1]);
                else if (!line.startsWith('serializedVersion')) inRect = false;

                continue;
            }

            // pivot
            if (line.startsWith('pivot:')) {
                const match = line.match(/x:\s*([\d.]+),\s*y:\s*([\d.]+)/);
                if (match) {
                    current.pivot.x = Number(match[1]);
                    current.pivot.y = Number(match[2]);
                }
            }
        }

        if (current) sprites.push(current);

        return sprites;
    }
}