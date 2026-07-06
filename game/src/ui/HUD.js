import { Container, Graphics, Sprite, Text, ColorMatrixFilter } from 'pixi.js';

export class HUD {
    constructor(game, onAction) {
        this.game = game;
        this.onAction = onAction;
        this.container = new Container();
        this.contextButtons = [];
        this.specRows = [];
        this.contextSignature = '';
        this.pointerOverAction = false;

        const overlayStyle = {
            fill: 0xf8fafc,
            fontSize: 16,
            lineHeight: 20,
            stroke: { color: 0x020617, width: 2 }
        };

        this.topBar = new Container();
        this.topBarItems = {};

        this.topBarBg = new Graphics();
        const cx = 640;
        const yTop = 10;
        const yMid = 46;
        const yBot = 60;
        const bgStyle = { color: 0x062f3c, alpha: 0.85 };
        const bgStroke = { color: 0x0c8397, width: 2 };

        this.topBarBg.poly([20, yTop, cx - 110, yTop, cx - 88, yMid, 20, yMid]).fill(bgStyle).stroke(bgStroke);
        this.topBarBg.poly([cx - 100, yTop, cx + 100, yTop, cx + 70, yBot, cx - 70, yBot]).fill(bgStyle).stroke(bgStroke);
        this.topBarBg.poly([cx + 110, yTop, 1280 - 20, yTop, 1280 - 20, yMid, cx + 88, yMid]).fill(bgStyle).stroke(bgStroke);
        this.topBar.addChild(this.topBarBg);

        this.waveProgressBg = new Graphics();
        this.waveProgressBg.poly([cx - 100, yTop, cx + 100, yTop, cx + 70, yBot, cx - 70, yBot]).fill({ color: 0x0c8397, alpha: 0.85 });
        this.topBar.addChild(this.waveProgressBg);

        this.waveProgressMask = new Graphics();
        this.waveProgressBg.mask = this.waveProgressMask;
        this.topBar.addChild(this.waveProgressMask);

        const createTopBarItem = (key, iconTexture, defaultLabel = '', yPos = 28) => {
            const container = new Container();
            container.y = yPos;
            let offsetX = 0;
            let sprite = null;
            if (iconTexture) {
                sprite = new Sprite(iconTexture);
                sprite.anchor.set(0, 0.5);
                sprite.height = 20;
                sprite.scale.x = sprite.scale.y;
                container.addChild(sprite);
                offsetX = sprite.width + 6;
            }
            const text = new Text({
                text: defaultLabel,
                style: overlayStyle
            });
            text.anchor.set(0, 0.5);
            text.x = offsetX;
            container.addChild(text);
            this.topBarItems[key] = { container, text, icon: sprite };
            this.topBar.addChild(container);
            return container;
        };

        createTopBarItem('bastionHp', this.game.assets.bastionBaseTexture).x = 40;
        createTopBarItem('playerHp', this.game.assets.lifeTexture).x = 240;

        this.playerHpFilter = new ColorMatrixFilter();
        if (this.topBarItems.playerHp.icon) {
            this.topBarItems.playerHp.icon.filters = [this.playerHpFilter];
        }

        createTopBarItem('resources', this.game.assets.coinTexture).x = 440;

        const waveItem = createTopBarItem('wave', null, 'Oleada', 35);
        waveItem.x = cx;
        this.topBarItems.wave.text.anchor.set(0.5, 0.5);

        createTopBarItem('zombies', this.game.assets.zombieTexture).x = 800;
        createTopBarItem('noise', null).x = 980;

        // Top bar buttons (placed inside the bar at y = 28, height 36)
        const createIconButton = (x, iconGraphics) => {
            const btn = new Container();
            btn.eventMode = 'static';
            btn.cursor = 'pointer';
            
            // The bar goes from y=10 to y=46, center is 28, height is 36
            const bg = new Graphics().rect(-16, -18, 32, 36).fill({ color: 0x0c8397, alpha: 0 }).stroke({ color: 0x085f6d, width: 1, alpha: 0 });
            btn.addChild(bg);
            btn.addChild(iconGraphics);
            
            btn.on('pointerover', () => {
                bg.clear().rect(-16, -18, 32, 36).fill({ color: 0x0c8397, alpha: 0.6 }).stroke({ color: 0x085f6d, width: 1, alpha: 1 });
            });
            btn.on('pointerout', () => {
                bg.clear().rect(-16, -18, 32, 36).fill({ color: 0x0c8397, alpha: 0 }).stroke({ color: 0x085f6d, width: 1, alpha: 0 });
            });
            
            btn.x = x;
            btn.y = 28;
            this.topBar.addChild(btn);
            return btn;
        };

        this.btnPlay = createIconButton(1135, new Graphics().poly([-3, -6, 7, 0, -3, 6]).fill(0xffffff));
        this.btnPlay.on('pointerdown', () => this.onAction({ kind: 'time', action: 'play' }));

        this.btnPause = createIconButton(1170, new Graphics().rect(-4, -6, 3, 12).rect(2, -6, 3, 12).fill(0xffffff));
        this.btnPause.on('pointerdown', () => this.onAction({ kind: 'time', action: 'pause' }));

        this.btnAccel = createIconButton(1205, new Graphics().poly([-6, -6, 0, 0, -6, 6]).poly([0, -6, 6, 0, 0, 6]).fill(0xffffff));
        this.btnAccel.on('pointerdown', () => this.onAction({ kind: 'time', action: 'accel' }));

        this.btnOptions = createIconButton(1240, new Graphics().circle(0, 0, 4).stroke({ color: 0xffffff, width: 2 }).circle(0, 0, 1).fill(0xffffff));
        this.btnOptions.on('pointerdown', () => {
            this.toggleOptionsMenu();
        });

        this.message = new Text({
            text: '',
            style: {
                fill: 0xfbbf24,
                fontSize: 17,
                stroke: { color: 0x020617, width: 3 }
            }
        });

        this.waveBanner = new Text({
            text: '',
            style: {
                fill: 0xf8fafc,
                fontSize: 34,
                fontWeight: '700',
                stroke: { color: 0x020617, width: 4 }
            }
        });
        this.waveBanner.anchor.set(0.5);

        this.rangeIndicator = new Graphics();

        this.contextTitle = new Text({
            text: '',
            style: {
                fill: 0xf8fafc,
                fontSize: 15,
                fontWeight: '700',
                stroke: { color: 0x020617, width: 3 }
            }
        });
        this.contextTitle.anchor.set(0.5, 1);

        this.specsContainer = new Container();

        this.contextContainer = new Container();
        this.contextContainer.visible = false;
        this.contextContainer.addChild(this.contextTitle);
        this.contextContainer.addChild(this.specsContainer);

        this.rightBar = new Container();
        this.rightBarItems = {};

        const createRightBarItem = (type, texture, yPos, hotkey) => {
            const btn = new Container();
            btn.eventMode = 'static';
            btn.cursor = 'pointer';
            
            const size = 44;
            const half = size / 2;
            
            const bg = new Graphics().rect(-half, -half, size, size).fill({ color: 0x062f3c, alpha: 0.85 }).stroke({ color: 0x0c8397, width: 1 });
            btn.addChild(bg);
            
            const sprite = new Sprite(texture);
            sprite.anchor.set(0.5);
            sprite.scale.set(0.19); // ~35px, fits in 44x44
            btn.addChild(sprite);

            const mask = new Graphics().rect(-half, half, size, 0).fill(0x000000);
            mask.alpha = 0.6;
            btn.addChild(mask);
            
            const hotkeyText = new Text({
                text: hotkey,
                style: {
                    fill: 0xffffff,
                    fontSize: 17,
                    fontWeight: 'bold',
                    stroke: { color: 0x000000, width: 2 }
                }
            });
            hotkeyText.x = 10;
            hotkeyText.y = 3;
            btn.addChild(hotkeyText);
            
            btn.on('pointerover', () => bg.stroke({ color: 0x38bdf8, width: 2 }));
            btn.on('pointerout', () => bg.stroke({ color: 0x0c8397, width: 2 }));
            btn.on('pointerdown', () => {
                if (this.onAction) this.onAction({ type: 'PLANT_EXPLOSIVE', explosiveType: type });
            });
            
            btn.x = 1240;
            btn.y = yPos;
            this.rightBar.addChild(btn);
            this.rightBarItems[type] = { container: btn, sprite, bg, mask };
        };

        createRightBarItem('c4', this.game.assets.placeC4Texture, 200, '1');
        createRightBarItem('landmine', this.game.assets.placeLandmineTexture, 250, '2');
        createRightBarItem('timebomb', this.game.assets.placeTimebombTexture, 300, '3');

        this.container.addChild(this.message);
        this.container.addChild(this.waveBanner);
        this.container.addChild(this.rangeIndicator);
        this.container.addChild(this.contextContainer);
        this.container.addChild(this.topBar);
        this.container.addChild(this.rightBar);
        
        this._buildOptionsMenu();
    }

    update(data) {
        const width = this.game.app.renderer.width;
        const height = this.game.app.renderer.height;

        this.topBarItems.bastionHp.text.text = `Bastion ${Math.ceil(data.fortressHp)}/${data.fortressMaxHp}`;
        this.topBarItems.playerHp.text.text = `Survivor ${Math.ceil(data.playerHp)}/${data.playerMaxHp}`;

        const healthRatio = Math.max(0, Math.min(1, data.playerHp / data.playerMaxHp));
        const t = 1 - healthRatio;
        this.playerHpFilter.matrix = [
            (1 - t) + t * 0.3, t * 0.59, t * 0.11, 0, 0,
            t * 0.3, (1 - t) + t * 0.59, t * 0.11, 0, 0,
            t * 0.3, t * 0.59, (1 - t) + t * 0.11, 0, 0,
            0, 0, 0, 1, 0
        ];
        this.topBarItems.resources.text.text = `${data.resources}`;
        this.topBarItems.wave.text.text = `Oleada ${data.wave - 1}`;

        if (data.explosiveCooldowns) {
            for (const type of ['c4', 'landmine', 'timebomb']) {
                const item = this.rightBarItems[type];
                if (!item) continue;
                
                const cd = data.explosiveCooldowns[type];
                const maxCd = this.game.config.explosives[type].cooldownMs;
                
                if (type === 'c4' && data.c4Planted) {
                    item.mask.visible = false;
                    item.container.eventMode = 'static';
                    item.sprite.tint = 0xff0000; // Red tint to indicate DETONATE mode
                } else if (cd > 0) {
                    const ratio = cd / maxCd;
                    item.mask.clear().rect(-22, 22 - 44 * ratio, 44, 44 * ratio).fill(0x000000);
                    item.mask.visible = true;
                    item.container.eventMode = 'none';
                    item.sprite.tint = 0x555555;
                } else {
                    item.mask.visible = false;
                    item.container.eventMode = 'static';
                    item.sprite.tint = 0xffffff;
                }
            }
        }

        this.waveProgressMask.clear();
        this.waveProgressMask.rect(540, 10, 200 * (data.waveProgress ?? 0), 50).fill(0xffffff);

        this.topBarItems.zombies.text.text = `Zombies ${data.zombies} (+${data.pendingSpawns})`;
        this.topBarItems.noise.text.text = `Ruido ${data.noises}`;

        this.message.x = 20;
        this.message.y = 104;
        this.message.text = data.message ?? '';

        this.waveBanner.x = width * 0.5;
        this.waveBanner.y = 140;
        this.waveBanner.text = data.waveBanner ?? '';
        this.waveBanner.visible = Boolean(data.waveBanner);

        this.renderContextMenu(data.contextMenu);
    }

    renderContextMenu(contextMenu) {
        if (!contextMenu) {
            this.contextContainer.visible = false;
            this.rangeIndicator.visible = false;
            this.pointerOverAction = false;
            return;
        }

        this.contextContainer.visible = true;
        this.rangeIndicator.visible = true;

        const signature = this.getContextSignature(contextMenu);
        if (signature !== this.contextSignature) {
            this.contextSignature = signature;
            this.rebuildContextButtons(contextMenu.actions);
            this.rebuildSpecRows(contextMenu.specs ?? []);
        }

        const anchor = contextMenu.anchor;
        this.contextTitle.x = anchor.x;
        this.contextTitle.y = anchor.y + 72;
        this.contextTitle.text = contextMenu.title;

        this.layoutSpecRows(anchor);

        this.drawRangeIndicator(anchor, contextMenu.previewRange ?? 0);
        this.layoutContextButtons(anchor, contextMenu.actions);
    }

    _buildOptionsMenu() {
        this.optionsContainer = new Container();
        this.optionsContainer.visible = false;
        this.optionsContainer.zIndex = 200;

        const overlay = new Graphics().rect(0, 0, 1280, 720).fill({ color: 0x000000, alpha: 0.6 });
        overlay.eventMode = 'static';
        this.optionsContainer.addChild(overlay);

        const menuBox = new Container();
        menuBox.x = 1280 / 2;
        menuBox.y = 720 / 2;
        
        const boxBg = new Graphics()
            .roundRect(-150, -180, 300, 360, 12)
            .fill(0x1e293b)
            .stroke({ color: 0x334155, width: 4 });
        menuBox.addChild(boxBg);

        const title = new Text({
            text: 'OPCIONES',
            style: { fill: 0xffffff, fontSize: 24, fontWeight: 'bold' }
        });
        title.anchor.set(0.5);
        title.y = -135;
        menuBox.addChild(title);

        const buildOptionButton = (label, yPos, callback) => {
            const btn = new Container();
            btn.eventMode = 'static';
            btn.cursor = 'pointer';
            
            const btnBg = new Graphics()
                .roundRect(-100, -22, 200, 44, 8)
                .fill(0x334155);
            
            const text = new Text({
                text: label,
                style: { fill: 0xffffff, fontSize: 18 }
            });
            text.anchor.set(0.5);
            
            btn.addChild(btnBg);
            btn.addChild(text);
            btn.y = yPos;
            
            btn.on('pointerover', () => btnBg.clear().roundRect(-100, -22, 200, 44, 8).fill(0x475569));
            btn.on('pointerout', () => btnBg.clear().roundRect(-100, -22, 200, 44, 8).fill(0x334155));
            btn.on('pointerdown', callback);
            return btn;
        };

        const btnClose = new Container();
        btnClose.eventMode = 'static';
        btnClose.cursor = 'pointer';
        const closeIcon = new Graphics().moveTo(-8, -8).lineTo(8, 8).moveTo(8, -8).lineTo(-8, 8).stroke({color: 0xffffff, width: 3});
        btnClose.addChild(closeIcon);
        btnClose.x = 120;
        btnClose.y = -135;
        btnClose.on('pointerdown', () => this.toggleOptionsMenu());
        menuBox.addChild(btnClose);

        menuBox.addChild(buildOptionButton('Guardar', -60, () => this.onAction({ kind: 'options', action: 'save' })));
        menuBox.addChild(buildOptionButton('Volumen', -5, () => this.onAction({ kind: 'options', action: 'volume' })));
        menuBox.addChild(buildOptionButton('Menú Principal', 50, () => this.onAction({ kind: 'options', action: 'mainmenu' })));
        menuBox.addChild(buildOptionButton('Salir', 105, () => this.onAction({ kind: 'options', action: 'exit' })));

        this.optionsContainer.addChild(menuBox);
        this.container.addChild(this.optionsContainer);
    }

    toggleOptionsMenu() {
        this.optionsContainer.visible = !this.optionsContainer.visible;
        if (this.optionsContainer.visible) {
            this.onAction({ kind: 'time', action: 'pause' });
        } else {
            this.onAction({ kind: 'time', action: 'play' });
        }
    }

    drawRangeIndicator(anchor, radius) {
        this.rangeIndicator.clear();

        if (!radius || radius <= 0) {
            this.rangeIndicator.visible = false;
            return;
        }

        this.rangeIndicator.visible = true;
        this.rangeIndicator
            .circle(anchor.x, anchor.y, radius)
            .fill({ color: 0x16a34a, alpha: 0.16 })
            .stroke({ color: 0x15803d, width: 3, alpha: 0.8 });
    }

    layoutContextButtons(anchor, actions) {
        const offsets = this.getActionOffsets(actions.length);

        for (let i = 0; i < this.contextButtons.length; i++) {
            const item = this.contextButtons[i];
            const offset = offsets[i] ?? { x: 0, y: 0 };
            item.container.x = anchor.x + offset.x;
            item.container.y = anchor.y + offset.y;
        }
    }

    getActionOffsets(count) {
        if (count === 3) {
            return [
                { x: -92, y: -64 },
                { x: 0, y: -108 },
                { x: 92, y: -64 }
            ];
        }

        if (count === 4) {
            return [
                { x: -156, y: -42 },
                { x: -54, y: -118 },
                { x: 54, y: -118 },
                { x: 156, y: -42 }
            ];
        }

        return Array.from({ length: count }, (_, index) => ({
            x: (index - (count - 1) * 0.5) * 88,
            y: -72
        }));
    }

    rebuildContextButtons(actions) {
        for (const item of this.contextButtons) {
            item.container.destroy({ children: true });
        }

        this.contextButtons = [];
        this.pointerOverAction = false;

        for (const action of actions) {
            const container = new Container();
            const sprite = new Sprite(this.getActionTexture(action));
            sprite.anchor.set(0.5, 1);
            sprite.width = 72;
            sprite.height = 88;
            sprite.eventMode = 'static';
            sprite.cursor = 'pointer';

            const price = new Text({
                text: this.getActionPrice(action.label),
                style: {
                    fill: 0xfbbf24,
                    fontSize: 14,
                    fontWeight: '700',
                    stroke: { color: 0x020617, width: 3 }
                }
            });
            price.anchor.set(0.5);
            price.x = 0;
            price.y = -12;

            sprite.on('pointerover', () => {
                this.pointerOverAction = true;
                sprite.alpha = 0.92;
                price.scale.set(1.04);
            });
            sprite.on('pointerout', () => {
                this.pointerOverAction = false;
                sprite.alpha = 1;
                price.scale.set(1);
            });
            sprite.on('pointerdown', () => this.onAction(action));

            container.addChild(sprite);
            container.addChild(price);
            this.contextButtons.push({ container, sprite, price });
            this.contextContainer.addChild(container);
        }
    }

    rebuildSpecRows(specs) {
        for (const row of this.specRows) {
            row.container.destroy({ children: true });
        }

        this.specRows = [];

        for (const spec of specs) {
            const container = new Container();
            const icon = new Sprite(this.getSpecTexture(spec));
            icon.anchor.set(0, 0.5);
            icon.width = 16;
            icon.height = 16;
            icon.x = 0;
            icon.y = 0;

            const text = new Text({
                text: `${spec.label}: ${spec.value}`,
                style: {
                    fill: 0xe2e8f0,
                    fontSize: 13,
                    stroke: { color: 0x020617, width: 2 }
                }
            });
            text.anchor.set(0, 0.5);
            text.x = 24;
            text.y = 0;

            container.addChild(icon);
            container.addChild(text);
            this.specRows.push({ container, icon, text });
            this.specsContainer.addChild(container);
        }
    }

    layoutSpecRows(anchor) {
        const hasRows = this.specRows.length > 0;
        this.specsContainer.visible = hasRows;
        if (!hasRows) return;

        const rowHeight = 18;
        const startX = anchor.x - 66;
        const startY = anchor.y + 102;

        for (let i = 0; i < this.specRows.length; i++) {
            const row = this.specRows[i];
            row.container.x = startX;
            row.container.y = startY + i * rowHeight;
        }
    }

    getActionTexture(action) {
        const textures = this.game.assets.contextButtonTextures;

        if (action.kind === 'build') {
            return textures.build[action.turretType];
        }

        if (action.kind === 'sell-slot') {
            return textures.sell;
        }

        return textures.upgrade[action.stat];
    }

    getSpecTexture(spec) {
        const specTextures = this.game.assets.hudSpecTextures;
        const turretSprites = this.game.assets.turretSprites;

        if (spec.key === 'type') {
            if (spec.type === 'fortress') {
                return this.game.assets.bastionBaseTexture;
            }

            return turretSprites[spec.type]?.head?.[0] ?? specTextures.type;
        }

        return specTextures[spec.key] ?? specTextures.type;
    }

    getActionPrice(label) {
        const match = /\$(\d+)/.exec(label ?? '');
        return match ? `$${match[1]}` : '';
    }

    getContextSignature(contextMenu) {
        const actionsSignature = contextMenu.actions
            .map((action) => [action.kind, action.iconKey ?? '', action.label, action.turretType ?? '', action.stat ?? '', action.slot?.index ?? '', action.slot?.turret?.level ?? ''].join(':'))
            .join('|');

        const specsSignature = (contextMenu.specs ?? [])
            .map((spec) => `${spec.key}:${spec.type ?? ''}:${spec.label}:${spec.value}`)
            .join('|');

        return `${contextMenu.title}::${specsSignature}::${contextMenu.anchor?.x ?? ''}:${contextMenu.anchor?.y ?? ''}::${contextMenu.previewRange ?? ''}::${actionsSignature}`;
    }
}
