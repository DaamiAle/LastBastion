import { Graphics } from 'pixi.js';
import { Scene } from '../../engine/core/Scene.js';
import { distanceSq, randomFloat } from '../../engine/utils/Utils.js';
import { SpatialHashGrid } from '../../engine/utils/SpatialHashGrid.js';
import { HUD } from '../../ui/HUD.js';
import { FortressEntity } from '../entities/FortressEntity.js';
import { PlayerEntity } from '../entities/PlayerEntity.js';
import { TurretSlotEntity } from '../entities/TurretSlotEntity.js';
import { assembleTurret, upgradeTurret, getTurretUpgradeCost, getTurretSellValue, getTurretStatsSummary } from '../assemblers/TurretAssembler.js';
import { TurretAIComponent } from '../components/TurretAIComponent.js';
import { assembleZombie } from '../assemblers/ZombieAssembler.js';
import { ZombieAIComponent } from '../components/ZombieAIComponent.js';
import { Transform } from '../components/Transform.js';
import { Health } from '../components/Health.js';
import { ExplosiveEntity } from '../entities/ExplosiveEntity.js';
import { ExplosionEffectEntity } from '../entities/ExplosionEffectEntity.js';
import { MainMenuScene } from './MainMenuScene.js';

export class GameScene extends Scene {
    constructor(game, options = {}) {
        super(game);

        const config = game.config;

        this.loadSave = options.loadSave ?? false;
        this.grid = new SpatialHashGrid(config.world.gridSize);
        this.resources = options.resources ?? config.economy.startingResources;
        this.wave = options.wave ?? config.waves.initialWave;
        this.waveState = 'charging'; // 'charging' or 'deploying'
        this.spawnQueue = 0;
        this.spawnTimer = 0;
        this.waveDelay = config.waves.initialDelayMs;
        this.waveDelayTimer = config.waves.initialDelayMs;
        this.waveDeployDurationMs = 0;
        this.waveDeployTimer = 0;
        this.selectedTurretType = config.ui.defaultSelectedTurretType;
        this.focusedSlot = null;
        this.interactionContext = null;
        this.message = 'Digit1 Ballesta | Digit2 Ametralladora | Digit3 Canon';
        this.messageTimer = 0;
        this.waveBanner = '';
        this.waveBannerTimer = 0;
        this.autosaveTimer = 0;
        this.noiseIdCounter = 1;
        this.noises = [];
        this.slots = [];
        this.explosiveCooldowns = { c4: 0, landmine: 0, timebomb: 0 };
        this.plantedC4 = null;
        this.zombiesKilled = 0;
        this.survivorDeaths = 0;
        this.isGameOver = false;
    }

    enter() {
        super.enter();

        const config = this.game.config;
        const radius = config.world.radiusInFortressWidths * config.fortress.footprint;
        const padding = config.world.extraViewportPadding;
        const worldSize = radius * 2 + padding;

        this.setWorldSize(worldSize, worldSize);
        this.cameraLerp = config.camera.lerp;

        this.drawArena();

        this.hud = new HUD(this.game, this.handleHudAction.bind(this));
        this.game.app.stage.addChild(this.hud.container);

        const centerX = this.worldWidth * 0.5;
        const centerY = this.worldHeight * 0.5;

        this.fortress = new FortressEntity(this, centerX, centerY);
        this.addEntity(this.fortress);

        this.player = new PlayerEntity(this, centerX, centerY + 180);
        this.addEntity(this.player);
        this.setCameraTarget(this.player);

        const slotDistance = config.slots.distanceFromCenter;
        const slotOffsets = [
            { x: -slotDistance, y: -slotDistance },
            { x: slotDistance, y: -slotDistance },
            { x: slotDistance, y: slotDistance },
            { x: -slotDistance, y: slotDistance }
        ];

        slotOffsets.forEach((offset, index) => {
            const slot = new TurretSlotEntity(this, centerX + offset.x, centerY + offset.y, index);
            this.slots.push(slot);
            this.addEntity(slot);
        });

        if (this.loadSave) {
            this.restoreProgress();
        } else {
            this.startNextWave();
        }
    }

    drawArena() {
        const world = this.game.config.world;
        const background = new Graphics()
            .rect(0, 0, this.worldWidth, this.worldHeight)
            .fill(world.backgroundColor);

        const grid = new Graphics();
        for (let x = 0; x <= this.worldWidth; x += world.gridSize) {
            grid.moveTo(x, 0).lineTo(x, this.worldHeight);
        }
        for (let y = 0; y <= this.worldHeight; y += world.gridSize) {
            grid.moveTo(0, y).lineTo(this.worldWidth, y);
        }
        grid.stroke({ color: world.gridColor, width: 1, alpha: 0.55 });

        const dangerRing = new Graphics()
            .circle(this.worldWidth * 0.5, this.worldHeight * 0.5, world.dangerRingRadius)
            .stroke({ color: world.dangerRingColor, width: 6, alpha: 0.35 });

        this.container.addChild(background);
        this.container.addChild(grid);
        this.container.addChild(dangerRing);
    }

    update(delta) {
        this.handleInput();
        this.updateWaveSpawner(delta);
        this.updateNoises(delta);
        this.refreshGrid();
        this.updateInteractionContext();

        super.update(delta);

        this.updateHud();
        this.updateTimers(delta);

        if (this.fortress.hp <= 0 && !this.isGameOver) {
            this.handleGameOver();
        }
    }

    handleGameOver() {
        this.isGameOver = true;
        const stats = {
            date: new Date().toLocaleDateString(),
            wave: this.wave,
            zombiesKilled: this.zombiesKilled,
            survivorDeaths: this.survivorDeaths
        };

        const scoresKey = 'bastion-highscores';
        let highscores = [];
        try {
            highscores = JSON.parse(localStorage.getItem(scoresKey)) || [];
        } catch (e) {
            highscores = [];
        }

        highscores.push(stats);
        
        highscores.sort((a, b) => {
            if (b.wave !== a.wave) return b.wave - a.wave;
            return b.zombiesKilled - a.zombiesKilled;
        });

        highscores = highscores.slice(0, 10);
        localStorage.setItem(scoresKey, JSON.stringify(highscores));
        
        // Remove current save if any since we lost
        localStorage.removeItem(this.game.config.saves.slot);

        this.game.sceneManager.change(new MainMenuScene(this.game));
    }

    handleInput() {
        const input = this.game.input;

        if (input.wasKeyPressed('Digit1')) this.plantExplosive('c4');
        if (input.wasKeyPressed('Digit2')) this.plantExplosive('landmine');
        if (input.wasKeyPressed('Digit3')) this.plantExplosive('timebomb');

        if (input.wasMousePressed()) {
            const point = this.getCursorWorldPoint();
            const slot = this.getSlotAtWorldPoint(point.x, point.y);
            this.focusedSlot = slot;
        }
    }

    getCursorWorldPoint() {
        return this.screenToWorld(this.game.input.mouse.x, this.game.input.mouse.y);
    }

    getSlotAtWorldPoint(x, y) {
        return this.slots.find((candidate) => candidate.containsWorldPoint(x, y)) ?? null;
    }

    isPointerOnMetaUI() {
        return Boolean(this.hud?.pointerOverAction);
    }

    selectTurret(type) {
        const config = this.game.config.turrets.types[type];
        this.selectedTurretType = type;
        this.pushMessage(`${config.label} seleccionada. Costo: ${config.cost}`);
    }

    tryBuildOrUpgrade(slot) {
        const inRange = distanceSq(
            slot.container.x,
            slot.container.y,
            this.player.container.x,
            this.player.container.y
        ) <= this.player.buildRange * this.player.buildRange;

        if (!inRange) {
            this.pushMessage('Acercate al slot para construir.');
            return;
        }

        const selectedConfig = this.game.config.turrets.types[this.selectedTurretType];

        if (!slot.turret) {
            if (this.resources < selectedConfig.cost) {
                this.pushMessage('No alcanza para construir esa torreta.');
                return;
            }

            this.resources -= selectedConfig.cost;
            slot.turret = assembleTurret(this, slot, this.selectedTurretType);
            
            // Re-insert slot into grid? Turrets are static so maybe not needed, but for nearest enemy it is.
            this.grid.insert(slot.turret, slot.container.x, slot.container.y);

            slot.redraw(true);
            this.pushMessage(`${selectedConfig.label} construida en slot ${slot.index + 1}.`);
            this.persistProgress();
            return;
        }

        this.pushMessage('Usa el menu contextual para mejorar o vender esa torreta.');
    }

    sellTurret(slot) {
        if (!slot?.turret) return;

        const refund = getTurretSellValue(this.game.world, this.game.config, slot.turret);
        this.resources += refund;
        
        this.game.world.destroyEntity(slot.turret);
        
        slot.turret = null;
        slot.redraw(false);
        this.pushMessage(`Torreta vendida por $${refund}.`);
        this.persistProgress();
    }

    upgradeFortressTurret(stat) {
        const fortress = this.fortress;
        if (!fortress) return;
        const cost = fortress.getUpgradeCost(stat);

        if (this.resources < cost) {
            this.pushMessage('No alcanza para mejorar la torreta principal.');
            return;
        }

        this.resources -= cost;
        fortress.upgrade(stat);
        this.pushMessage(`Torreta principal mejorada en ${this.getUpgradeStatLabel(stat)} a nivel ${fortress.level}.`);
        this.persistProgress();
    }

    upgradeSlotTurret(slot, stat) {
        if (!slot?.turret) return;

        const ai = this.game.world.getComponent(slot.turret, TurretAIComponent);
        if (ai && ai.upgradeLevels[stat] >= 10) {
            this.pushMessage('MÁXIMO NIVEL ALCANZADO.');
            return;
        }

        const cost = getTurretUpgradeCost(this.game.world, this.game.config.turrets, slot.turret, stat);
        if (this.resources < cost) {
            this.pushMessage('No alcanza para mejorar esa torreta.');
            return;
        }

        this.resources -= cost;
        upgradeTurret(this.game.world, this.game.config.turrets, slot.turret, stat);
        slot.redraw(true);
        this.pushMessage(`${ai.label} mejorada en ${this.getUpgradeStatLabel(stat)} a nivel ${ai.level}.`);
        this.persistProgress();
    }

    handleHudAction(action) {
        if (!action) return;

        if (action.kind === 'time') {
            if (action.action === 'play') {
                this.game.time.scale = 1;
                this.game.time.isPaused = false;
            } else if (action.action === 'pause') {
                this.game.time.isPaused = true;
            } else if (action.action === 'accel') {
                this.game.time.scale = 2;
                this.game.time.isPaused = false;
            }
            return;
        }

        if (action.kind === 'options') {
            console.log("Opción de menú seleccionada: ", action.action);
            return;
        }

        if (action.kind === 'build') {
            this.selectedTurretType = action.turretType;
            this.tryBuildOrUpgrade(action.slot);
            return;
        }

        if (action.kind === 'upgrade-slot-stat') {
            this.upgradeSlotTurret(action.slot, action.stat);
            return;
        }

        if (action.kind === 'sell-slot') {
            this.sellTurret(action.slot);
            return;
        }

        if (action.kind === 'upgrade-fortress-stat') {
            this.upgradeFortressTurret(action.stat);
            return;
        }

        if (action.type === 'PLANT_EXPLOSIVE') {
            this.plantExplosive(action.explosiveType);
            return;
        }
    }

    plantExplosive(type) {
        if (type === 'c4' && this.plantedC4) {
            this.plantedC4.detonate();
            this.plantedC4 = null;
            this.explosiveCooldowns.c4 = this.game.config.explosives.c4.cooldownMs;
            return;
        }

        if (this.explosiveCooldowns[type] > 0) return;

        const explosive = new ExplosiveEntity(this, this.player.container.x, this.player.container.y, type);
        this.addEntity(explosive);

        if (type === 'c4') {
            this.plantedC4 = explosive;
        } else {
            this.explosiveCooldowns[type] = this.game.config.explosives[type].cooldownMs;
        }
    }

    spawnExplosion(x, y, radius) {
        this.addEntity(new ExplosionEffectEntity(this, x, y, radius));
    }

    updateWaveSpawner(delta) {
        const config = this.game.config.waves;

        if (this.waveState === 'charging') {
            this.waveDelayTimer -= delta.deltaMS;
            if (this.waveDelayTimer <= 0) {
                this.waveDelayTimer = 0;
                this.startNextWave();
            }
        } else if (this.waveState === 'deploying') {
            this.waveDeployTimer -= delta.deltaMS;

            if (this.spawnQueue > 0) {
                this.spawnTimer -= delta.deltaMS;
                while (this.spawnTimer <= 0 && this.spawnQueue > 0) {
                    this.spawnTimer += config.spawnIntervalMs;
                    if (this.spawnEnemy()) {
                        this.spawnQueue--;
                    } else {
                        break; // fallback if spawn fails
                    }
                }
            }

            if (this.waveDeployTimer <= 0) {
                this.waveDeployTimer = 0;
                this.waveState = 'charging';
                this.waveDelay = config.delayBetweenWavesMs;
                this.waveDelayTimer = this.waveDelay;
                this.wave += 1;
            }
        }
    }

    updateNoises(delta) {
        for (const noise of this.noises) {
            noise.ttl -= delta.deltaMS;
        }

        this.noises = this.noises.filter((noise) => noise.ttl > 0);
    }

    emitNoise(x, y, options = {}) {
        const config = this.game.config.noise;

        this.noises.push({
            id: this.noiseIdCounter++,
            x,
            y,
            radius: options.radius ?? config.defaultRadius,
            ttl: options.ttl ?? config.defaultTtlMs,
            strength: options.strength ?? config.defaultStrength
        });
    }

    startNextWave() {
        const economy = this.game.config.economy;
        const waves = this.game.config.waves;

        this.waveState = 'deploying';
        this.waveTotalSpawns = this.getWaveSpawnCount(this.wave);
        this.spawnQueue = this.waveTotalSpawns;

        const deploySeconds = Math.ceil(this.waveTotalSpawns / (1000 / waves.spawnIntervalMs));
        this.waveDeployDurationMs = deploySeconds * 1000;
        this.waveDeployTimer = this.waveDeployDurationMs;

        this.spawnTimer = waves.firstSpawnDelayMs;

        this.resources += economy.waveStartRewardBase + Math.floor(this.wave * economy.waveStartRewardPerWave);
        //this.waveBanner = `OLEADA ${this.wave}`;
        this.waveBannerTimer = this.game.config.ui.waveBannerDurationMs;
        if (this.wave > 1) {
            this.pushMessage(`Oleada ${this.wave - 1} iniciada.`);
        }
        this.persistProgress();
    }

    getSpawnPoint(mode = 'wave') {
        const world = this.game.config.world;
        const centerX = this.worldWidth * 0.5;
        const centerY = this.worldHeight * 0.5;
        const angle = randomFloat(0, Math.PI * 2);
        const minRadius = mode === 'ambient' ? world.ambientSpawnRadiusMin : world.waveSpawnRadiusMin;
        const maxRadius = mode === 'ambient' ? world.ambientSpawnRadiusMax : world.waveSpawnRadiusMax;
        const radius = randomFloat(minRadius, maxRadius);
        const x = Math.max(world.padding, Math.min(this.worldWidth - world.padding, centerX + Math.cos(angle) * radius));
        const y = Math.max(world.padding, Math.min(this.worldHeight - world.padding, centerY + Math.sin(angle) * radius));

        return [x, y];
    }

    getWaveSpawnCount(wave) {
        const multiplier = this.game.config.waves.fibonacciMultiplier;
        return this.getFibonacci(Math.max(1, wave)) * multiplier;
    }

    getFibonacci(index) {
        // 1st (index 1) = 0
        // 2nd (index 2) = 1
        // 3rd (index 3) = 1
        // 4th (index 4) = 2
        let a = 0;
        let b = 1;
        for (let i = 1; i < index; i++) {
            let temp = a + b;
            a = b;
            b = temp;
        }
        return a;
    }

    spawnEnemy() {
        if (this.getEnemies().length >= this.game.config.zombies.maxAliveCount) {
            return false;
        }

        assembleZombie(this, ...this.getSpawnPoint('wave'));
        return true;
    }

    refreshGrid() {
        this.grid.clear();

        for (const entity of this.entities) {
            if (!entity.isAlive || !entity.container) continue;

            if (entity.type === 'zombie' || entity.type === 'player' || entity.type === 'fortress' || entity.type === 'turret') {
                this.grid.insert(entity, entity.container.x, entity.container.y);
            }
        }

        const ecsZombies = this.game.world.getEntitiesWith(ZombieAIComponent, Transform);
        for (const entityId of ecsZombies) {
            const transform = this.game.world.getComponent(entityId, Transform);
            this.grid.insert(entityId, transform.x, transform.y);
        }
    }

    findNearestEnemy(x, y, range = Infinity) {
        let closest = null;
        let bestDistSq = range * range;
        const pool = Number.isFinite(range) ? this.grid.queryRadius(x, y, range) : this.getEnemies();

        for (const entity of pool) {
            if (typeof entity === 'number') {
                const ai = this.game.world.getComponent(entity, ZombieAIComponent);
                const health = this.game.world.getComponent(entity, Health);
                const transform = this.game.world.getComponent(entity, Transform);
                
                if (!ai || !health || !health.isAlive || !transform) continue;

                const distSq = distanceSq(x, y, transform.x, transform.y);
                if (distSq < bestDistSq) {
                    bestDistSq = distSq;
                    closest = entity;
                }
            } else {
                if (entity.type !== 'zombie' || !entity.isAlive) continue;

                const distSq = distanceSq(x, y, entity.container.x, entity.container.y);
                if (distSq < bestDistSq) {
                    bestDistSq = distSq;
                    closest = entity;
                }
            }
        }

        return closest;
    }

    findNearestDefenseTarget(x, y, radius) {
        const candidates = [];

        if (this.fortress?.isAlive) candidates.push(this.fortress);
        if (this.player && !this.player.isDead) candidates.push(this.player);
        for (const slot of this.slots) {
            if (slot.turret !== null && slot.turret !== undefined) {
                candidates.push(slot.turret);
            }
        }

        let best = null;
        let bestDistSq = radius * radius;

        for (const candidate of candidates) {
            let cx, cy;
            if (typeof candidate === 'number') {
                const health = this.game.world.getComponent(candidate, Health);
                const transform = this.game.world.getComponent(candidate, Transform);
                if (!health || !health.isAlive || !transform) continue;
                cx = transform.x;
                cy = transform.y;
            } else {
                if (!candidate.isAlive) continue;
                cx = candidate.container.x;
                cy = candidate.container.y;
            }

            const distSq = distanceSq(x, y, cx, cy);
            if (distSq < bestDistSq) {
                bestDistSq = distSq;
                best = candidate;
            }
        }

        return best;
    }

    keepEntityOutsideFortress(entity, extraPadding = 0) {
        if (!this.fortress?.isAlive || !entity?.container) return;

        const dx = entity.container.x - this.fortress.container.x;
        const dy = entity.container.y - this.fortress.container.y;
        const distance = Math.hypot(dx, dy) || 0.0001;
        const minDistance = (this.fortress.radius ?? 0) + (entity.radius ?? 0) + extraPadding;

        if (distance >= minDistance) return;

        const push = minDistance - distance;
        entity.container.x += (dx / distance) * push;
        entity.container.y += (dy / distance) * push;
    }

    updateInteractionContext() {
        const maxDistance = this.game.config.ui.interactionLabelDistance;
        const px = this.player.container.x;
        const py = this.player.container.y;

        let bestContext = null;
        let bestDistSq = maxDistance * maxDistance;

        const fortressDistSq = distanceSq(px, py, this.fortress.container.x, this.fortress.container.y);
        if (fortressDistSq < bestDistSq) {
            bestDistSq = fortressDistSq;
            bestContext = {
                type: 'fortress',
                entity: this.fortress
            };
        }

        for (const slot of this.slots) {
            const slotDistSq = distanceSq(px, py, slot.container.x, slot.container.y);
            if (slotDistSq < bestDistSq) {
                bestDistSq = slotDistSq;
                bestContext = {
                    type: 'slot',
                    entity: slot
                };
            }
        }

        this.interactionContext = bestContext;
    }

    findLoudestNoise(x, y) {
        let best = null;
        let bestScore = 0;

        for (const noise of this.noises) {
            const distSq = distanceSq(x, y, noise.x, noise.y);
            if (distSq > noise.radius * noise.radius) continue;

            const dist = Math.sqrt(distSq);
            const score = noise.strength * (1 - dist / noise.radius);

            if (score > bestScore) {
                bestScore = score;
                best = noise;
            }
        }

        return best;
    }

    findZombieStimulus(zombie) {
        const config = this.game.config.zombies;
        const world = this.game.config.world;
        const zx = zombie.container.x;
        const zy = zombie.container.y;
        const nearbyDefense = this.findNearestDefenseTarget(zx, zy, zombie.detectionRadius);

        if (nearbyDefense) {
            return {
                kind: 'entity',
                entity: nearbyDefense,
                point: null,
                noiseId: null
            };
        }

        const heardNoise = this.findLoudestNoise(zx, zy);
        if (heardNoise) {
            return {
                kind: 'noise',
                entity: null,
                point: { x: heardNoise.x, y: heardNoise.y },
                noiseId: heardNoise.id
            };
        }

        zombie.wanderTimer -= 16;
        const reachedTarget = zombie.targetPoint
            && distanceSq(zx, zy, zombie.targetPoint.x, zombie.targetPoint.y) < config.wanderArrivalRadius * config.wanderArrivalRadius;

        if (!zombie.targetPoint || zombie.wanderTimer <= 0 || reachedTarget) {
            zombie.wanderTimer = config.wanderRetargetMinMs + Math.random() * (config.wanderRetargetMaxMs - config.wanderRetargetMinMs);
            zombie.wanderAngle += randomFloat(-config.wanderAngleJitter, config.wanderAngleJitter);
            const wanderDistance = randomFloat(config.wanderDistanceMin, config.wanderDistanceMax);

            zombie.targetPoint = {
                x: Math.max(world.padding, Math.min(this.worldWidth - world.padding, zx + Math.cos(zombie.wanderAngle) * wanderDistance)),
                y: Math.max(world.padding, Math.min(this.worldHeight - world.padding, zy + Math.sin(zombie.wanderAngle) * wanderDistance))
            };
        }

        return {
            kind: 'wander',
            entity: null,
            point: zombie.targetPoint,
            noiseId: null
        };
    }

    getEnemies() {
        const oldZombies = this.entities.filter((entity) => entity.type === 'zombie' && entity.isAlive);
        const ecsZombies = Array.from(this.game.world.getEntitiesWith(ZombieAIComponent, Health)).filter(entityId => {
            const health = this.game.world.getComponent(entityId, Health);
            return health && health.isAlive;
        });
        return [...oldZombies, ...ecsZombies];
    }

    onZombieKilled() {
        const economy = this.game.config.economy;
        
        this.zombiesKilled++;
        this.resources += economy.killReward;
    }

    onPlayerDied() {
        this.survivorDeaths++;
    }

    updateHud() {
        for (const slot of this.slots) {
            let matchesType = false;
            if (slot.turret) {
                const ai = this.game.world.getComponent(slot.turret, TurretAIComponent);
                if (ai && ai.turretType === this.selectedTurretType) {
                    matchesType = true;
                }
            }
            const highlighted = slot === this.focusedSlot
                || slot === this.interactionContext?.entity
                || matchesType;
            slot.redraw(highlighted);
        }

        const turretMeta = {
            sniper: this.game.config.turrets.types['sniper'],
            machinegun: this.game.config.turrets.types['machinegun'],
            cannon: this.game.config.turrets.types['cannon']
        };
        const selectedTurret = this.game.config.turrets.types[this.selectedTurretType];
        const contextMenu = this.buildContextMenu();

        let waveProgress = 0;
        if (this.waveState === 'charging') {
            waveProgress = this.waveDelay > 0 ? 1 - (this.waveDelayTimer / this.waveDelay) : 1;
        } else if (this.waveState === 'deploying') {
            waveProgress = this.waveDeployDurationMs > 0 ? (this.waveDeployTimer / this.waveDeployDurationMs) : 0;
        }
        waveProgress = Math.max(0, Math.min(1, waveProgress));

        this.hud.update({
            fortressHp: this.fortress.hp,
            fortressMaxHp: this.fortress.maxHp,
            playerHp: this.player.health,
            playerMaxHp: this.player.maxHealth,
            resources: this.resources,
            wave: this.wave,
            waveProgress: waveProgress,
            zombies: this.getEnemies().length,
            pendingSpawns: this.spawnQueue,
            noises: this.noises.length,
            selectedTurret: {
                label: selectedTurret.label,
                upgradeCost: Math.round(selectedTurret.cost * 1.2)
            },
            turretMeta,
            message: this.messageTimer > 0 ? this.message : '',
            waveBanner: this.waveBannerTimer > 0 ? this.waveBanner : '',
            contextMenu,
            explosiveCooldowns: this.explosiveCooldowns,
            c4Planted: !!this.plantedC4
        });
    }

    buildContextMenu() {
        if (!this.interactionContext) return null;

        if (this.interactionContext.type === 'fortress') {
            const anchor = this.worldToScreen(this.fortress.container.x, this.fortress.container.y);
            return {
                title: `Torreta principal Nv ${this.fortress.level}`,
                specs: this.buildTurretSpecs({
                    type: 'fortress',
                    label: 'Central',
                    fireRate: this.fortress.fireRate,
                    damage: this.fortress.damage,
                    range: this.fortress.attackRange
                }),
                anchor,
                previewRange: this.fortress.attackRange,
                actions: this.buildUpgradeActions('upgrade-fortress-stat', this.fortress)
            };
        }

        const slot = this.interactionContext.entity;
        const anchor = this.worldToScreen(slot.container.x, slot.container.y);
        if (!slot.turret) {
            const turretTypes = ['machinegun', 'sniper', 'cannon'];
            return {
                title: `Slot ${slot.index + 1} vacio`,
                anchor,
                actions: turretTypes.map((type) => {
                    const config = this.game.config.turrets.types[type];
                    return {
                        kind: 'build',
                        turretType: type,
                        iconKey: `build:${type}`,
                        slot,
                        label: `${config.label} $${config.cost}`
                    };
                })
            };
        }

        const ai = this.game.world.getComponent(slot.turret, TurretAIComponent);
        if (!ai) return null;

        const config = this.game.config.turrets.types[ai.turretType];

        return {
            title: `Slot ${slot.index + 1} | ${config.label} Nv ${ai.level}`,
            specs: this.buildTurretSpecs({
                type: ai.turretType,
                label: config.label,
                fireRate: ai.fireRate,
                damage: ai.damage,
                range: ai.range
            }),
            anchor,
            previewRange: ai.range,
            actions: [
                ...this.buildUpgradeActions('upgrade-slot-stat', slot.turret, { slot }),
                {
                    kind: 'sell-slot',
                    iconKey: 'sell',
                    slot,
                    label: `Vender $${getTurretSellValue(this.game.world, this.game.config, slot.turret)}`
                }
            ]
        };
    }

    updateTimers(delta) {
        this.messageTimer = Math.max(0, this.messageTimer - delta.deltaMS);
        this.waveBannerTimer = Math.max(0, this.waveBannerTimer - delta.deltaMS);
        this.autosaveTimer += delta.deltaMS;

        for (const key in this.explosiveCooldowns) {
            if (this.explosiveCooldowns[key] > 0) {
                this.explosiveCooldowns[key] = Math.max(0, this.explosiveCooldowns[key] - delta.deltaMS);
            }
        }

        if (this.autosaveTimer >= 5000) {
            this.autosaveTimer = 0;
            this.persistProgress();
        }
    }

    pushMessage(text) {
        this.message = text;
        this.messageTimer = this.game.config.ui.messageDurationMs;
    }

    buildTurretSpecs({ type, label, fireRate, damage, range }) {
        return [
            { key: 'type', label: 'Type', value: label, type },
            { key: 'fireRate', label: 'Fire rate', value: `${Math.round(fireRate)} ms` },
            { key: 'damage', label: 'Damage', value: `${Math.round(damage)}` },
            { key: 'range', label: 'Range', value: `${Math.round(range)}` }
        ];
    }

    buildUpgradeActions(kind, target, extra = {}) {
        return ['cadence', 'damage', 'range'].map((stat) => {
            let labelText = '';
            let disabled = false;
            
            if (typeof target === 'number') {
                const ai = this.game.world.getComponent(target, TurretAIComponent);
                if (ai && ai.upgradeLevels[stat] >= 10) {
                    labelText = `[MAX] ${this.getUpgradeStatLabel(stat)}`;
                    disabled = true; // El boton podría soportar disabled si la UI lo permitiese a futuro
                } else {
                    labelText = `${this.getUpgradeStatLabel(stat)} $${getTurretUpgradeCost(this.game.world, this.game.config.turrets, target, stat)}`;
                }
            } else {
                labelText = `${this.getUpgradeStatLabel(stat)} $${target.getUpgradeCost(stat)}`;
            }

            return {
                kind,
                stat,
                iconKey: `upgrade:${stat}`,
                label: labelText,
                disabled,
                ...extra
            };
        });
    }

    getUpgradeStatLabel(stat) {
        if (stat === 'cadence') return 'Cadencia';
        if (stat === 'damage') return 'Danio';
        if (stat === 'range') return 'Rango';
        return stat;
    }

    persistProgress() {
        const turretData = this.slots.map((slot) => {
            if (!slot.turret) return null;

            const ai = this.game.world.getComponent(slot.turret, TurretAIComponent);
            const health = this.game.world.getComponent(slot.turret, Health);
            if (!ai || !health) return null;

            return {
                type: ai.turretType,
                level: ai.level,
                health: health.hp,
                invested: ai.invested,
                upgradeLevels: { ...ai.upgradeLevels }
            };
        });

        this.game.save.save(this.game.config.saves.slot, {
            wave: this.wave,
            resources: this.resources,
            selectedTurretType: this.selectedTurretType,
            fortressHp: this.fortress.hp,
            fortressUpgradeLevels: { ...this.fortress.upgradeLevels },
            player: {
                x: this.player.container.x,
                y: this.player.container.y,
                health: this.player.health
            },
            turrets: turretData
        });
    }

    restoreProgress() {
        const data = this.game.save.load(this.game.config.saves.slot);
        if (!data) {
            this.pushMessage('No habia partida guardada. Se inicia una nueva.');
            return;
        }

        this.wave = data.wave ?? this.wave;
        this.resources = data.resources ?? this.resources;
        this.selectedTurretType = data.selectedTurretType ?? this.selectedTurretType;

        if (data.fortressUpgradeLevels) {
            for (const stat of ['damage', 'range', 'cadence']) {
                const times = data.fortressUpgradeLevels[stat] ?? 0;
                for (let i = 0; i < times; i++) {
                    this.fortress.upgrade(stat);
                }
            }
        }

        this.fortress.hp = Math.min(this.fortress.maxHp, data.fortressHp ?? this.fortress.hp);

        if (data.player) {
            this.player.container.x = data.player.x ?? this.player.container.x;
            this.player.container.y = data.player.y ?? this.player.container.y;
            this.player.health = data.player.health ?? this.player.health;
        }

        if (Array.isArray(data.turrets)) {
            data.turrets.forEach((savedTurret, index) => {
                if (!savedTurret) return;

                const slot = this.slots[index];
                if (!slot) return;

                slot.turret = assembleTurret(this, slot, savedTurret.type);

                if (savedTurret.upgradeLevels) {
                    for (const stat of ['damage', 'range', 'cadence']) {
                        const times = savedTurret.upgradeLevels[stat] ?? 0;
                        for (let i = 0; i < times; i++) {
                            upgradeTurret(this.game.world, this.game.config.turrets, slot.turret, stat);
                        }
                    }
                } else {
                    const ai = this.game.world.getComponent(slot.turret, TurretAIComponent);
                    while (ai.level < (savedTurret.level ?? 1)) {
                        upgradeTurret(this.game.world, this.game.config.turrets, slot.turret, 'damage');
                    }
                }
                
                if (savedTurret.health !== undefined) {
                    const health = this.game.world.getComponent(slot.turret, Health);
                    if (health) health.hp = savedTurret.health;
                }

                if (savedTurret.invested !== undefined) {
                    const ai = this.game.world.getComponent(slot.turret, TurretAIComponent);
                    if (ai) ai.invested = savedTurret.invested;
                }
            });
        }

        this.pushMessage(`Partida cargada. Oleada actual: ${this.wave - 1}.`);
    }

    exit() {
        this.persistProgress();

        super.exit();

        if (this.hud) {
            this.hud.container.destroy({ children: true });
            this.hud = null;
        }

        // Limpiar las entidades del mundo ECS para que no interactúen con la siguiente escena
        this.game.world.clear();
    }
}
