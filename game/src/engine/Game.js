import { Application, Assets } from 'pixi.js';
import { SceneManager } from './SceneManager.js';
import { Input } from './Input.js';
import { SaveService } from './SaveService.js';
import { SpriteSheetMeta } from './assets/SpriteSheetMeta.js';
import { createFramesFromMeta } from './utils/spriteFrames.js';
import { GAME_CONFIG } from '../game/config/gameConfig.js';

export class Game {
    constructor() {
        this.app = new Application();
        this.sceneManager = new SceneManager(this);
        this.input = new Input();
        this.save = new SaveService();
        this.assets = {};
        this.config = GAME_CONFIG;
    }

    async init() {
        await this.app.init({
            width: this.config.app.width,
            height: this.config.app.height,
            backgroundColor: this.config.app.backgroundColor
        });

        document.body.appendChild(this.app.canvas);

        await this.loadAssets();

        this.app.ticker.add(this.update.bind(this));
    }

    async loadAssets() {
        const walkTexture = await Assets.load('/assets/Walk_player.png');
        const walkMetaText = await fetch('/assets/Walk_player.png.meta').then((response) => response.text());
        const walkMeta = new SpriteSheetMeta(walkMetaText);
        const [
            zombieTexture,
            bastionBaseTexture,
            turretSlotTexture,
            turretRadiusTexture,
            machinegunBulletTexture,
            sniperBulletTexture,
            areacannonBulletTexture,
            healthBarBgTexture,
            healthBarFillTexture,
            hudTypeTexture,
            hudRateTexture,
            hudDamageTexture,
            hudRangeTexture,
            buttonBuyMachinegun,
            buttonBuyAreaCannon,
            buttonBuySniper,
            buttonUpgradeDamage,
            buttonUpgradeRange,
            buttonUpgradeFireRate,
            buttonSell,
            machinegunBaseLvl1,
            machinegunBaseLvl2,
            machinegunBaseLvl3,
            machinegunLvl1,
            machinegunLvl2,
            machinegunLvl3,
            sniperBaseLvl1,
            sniperBaseLvl2,
            sniperBaseLvl3,
            sniperLvl1,
            sniperLvl2,
            sniperLvl3,
            areacannonBaseLvl1,
            areacannonBaseLvl2,
            areacannonBaseLvl3,
            areacannonLvl1,
            areacannonLvl2,
            areacannonLvl3,
            coinTexture,
            lifeTexture,
            explosionTexture,
            explosivePlantedTexture,
            placeC4Texture,
            placeLandmineTexture,
            placeTimebombTexture
        ] = await Promise.all([
            Assets.load('/assets/zombie.png'),
            Assets.load('/assets/sprites/bastion_base.png'),
            Assets.load('/assets/sprites/turrets/turret_slot.png'),
            Assets.load('/assets/sprites/turrets/turret_radius.png'),
            Assets.load('/assets/sprites/turrets/machinegun_bullet.png'),
            Assets.load('/assets/sprites/turrets/sniper_bullet.png'),
            Assets.load('/assets/sprites/turrets/areacannon_bullet.png'),
            Assets.load('/assets/sprites/healt_bar_bg.png'),
            Assets.load('/assets/sprites/healt_bar.png'),
            Assets.load('/assets/sprites/turrets/hud/rank_indicator.png'),
            Assets.load('/assets/sprites/turrets/hud/rate.png'),
            Assets.load('/assets/sprites/turrets/hud/damage.png'),
            Assets.load('/assets/sprites/turrets/hud/range.png'),
            Assets.load('/assets/sprites/turret_button/buy_machinegun.png'),
            Assets.load('/assets/sprites/turret_button/buy_areacannon.png'),
            Assets.load('/assets/sprites/turret_button/buy_sniper.png'),
            Assets.load('/assets/sprites/turret_button/buy_upgrade_damage.png'),
            Assets.load('/assets/sprites/turret_button/buy_upgrade_range.png'),
            Assets.load('/assets/sprites/turret_button/buy_upgrade_firerate.png'),
            Assets.load('/assets/sprites/turret_button/sell.png'),
            Assets.load('/assets/sprites/turrets/machinegun_base_lvl1.png'),
            Assets.load('/assets/sprites/turrets/machinegun_base_lvl2.png'),
            Assets.load('/assets/sprites/turrets/machinegun_base_lvl3.png'),
            Assets.load('/assets/sprites/turrets/machinegun_lvl1.png'),
            Assets.load('/assets/sprites/turrets/machinegun_lvl2.png'),
            Assets.load('/assets/sprites/turrets/machinegun_lvl3.png'),
            Assets.load('/assets/sprites/turrets/sniper_base_lvl1.png'),
            Assets.load('/assets/sprites/turrets/sniper_base_lvl2.png'),
            Assets.load('/assets/sprites/turrets/sniper_base_lvl3.png'),
            Assets.load('/assets/sprites/turrets/sniper_lvl1.png'),
            Assets.load('/assets/sprites/turrets/sniper_lvl2.png'),
            Assets.load('/assets/sprites/turrets/sniper_lvl3.png'),
            Assets.load('/assets/sprites/turrets/areacannon_base_lvl1.png'),
            Assets.load('/assets/sprites/turrets/areacannon_base_lvl2.png'),
            Assets.load('/assets/sprites/turrets/areacannon_base_lvl3.png'),
            Assets.load('/assets/sprites/turrets/areacannon_lvl1.png'),
            Assets.load('/assets/sprites/turrets/areacannon_lvl2.png'),
            Assets.load('/assets/sprites/turrets/areacannon_lvl3.png'),
            Assets.load('/assets/sprites/coin-1.png'),
            Assets.load('/assets/sprites/hud_info/hud_life.png'),
            Assets.load('/assets/sprites/survivor_drop/explosion.png'),
            Assets.load('/assets/sprites/survivor_drop/explosive_planted.png'),
            Assets.load('/assets/sprites/survivor_drop/place_c4bomb.png'),
            Assets.load('/assets/sprites/survivor_drop/place_landmine.png'),
            Assets.load('/assets/sprites/survivor_drop/place_timebomb.png')
        ]);

        this.assets.playerWalk = walkTexture;
        this.assets.playerWalkFrames = createFramesFromMeta(walkTexture, walkMeta.sprites);
        this.assets.playerIdleFrame = this.assets.playerWalkFrames[0] ?? null;
        this.assets.zombieTexture = zombieTexture;
        this.assets.bastionBaseTexture = bastionBaseTexture;
        this.assets.turretSlotTexture = turretSlotTexture;
        this.assets.turretRadiusTexture = turretRadiusTexture;
        this.assets.machinegunBulletTexture = machinegunBulletTexture;
        this.assets.sniperBulletTexture = sniperBulletTexture;
        this.assets.cannonBulletTexture = areacannonBulletTexture;
        this.assets.healthBarBgTexture = healthBarBgTexture;
        this.assets.healthBarFillTexture = healthBarFillTexture;
        this.assets.coinTexture = coinTexture;
        this.assets.lifeTexture = lifeTexture;
        this.assets.explosionTexture = explosionTexture;
        this.assets.explosivePlantedTexture = explosivePlantedTexture;
        this.assets.placeC4Texture = placeC4Texture;
        this.assets.placeLandmineTexture = placeLandmineTexture;
        this.assets.placeTimebombTexture = placeTimebombTexture;
        this.assets.hudSpecTextures = {
            type: hudTypeTexture,
            fireRate: hudRateTexture,
            damage: hudDamageTexture,
            range: hudRangeTexture
        };
        this.assets.contextButtonTextures = {
            build: {
                machinegun: buttonBuyMachinegun,
                cannon: buttonBuyAreaCannon,
                sniper: buttonBuySniper
            },
            upgrade: {
                damage: buttonUpgradeDamage,
                range: buttonUpgradeRange,
                cadence: buttonUpgradeFireRate
            },
            sell: buttonSell
        };
        this.assets.turretSprites = {
            machinegun: {
                base: [machinegunBaseLvl1, machinegunBaseLvl2, machinegunBaseLvl3],
                head: [machinegunLvl1, machinegunLvl2, machinegunLvl3]
            },
            sniper: {
                base: [sniperBaseLvl1, sniperBaseLvl2, sniperBaseLvl3],
                head: [sniperLvl1, sniperLvl2, sniperLvl3]
            },
            cannon: {
                base: [areacannonBaseLvl1, areacannonBaseLvl2, areacannonBaseLvl3],
                head: [areacannonLvl1, areacannonLvl2, areacannonLvl3]
            }
        };
    }

    update(delta) {
        this.sceneManager.update(delta);
        this.input.endFrame();
    }
}
