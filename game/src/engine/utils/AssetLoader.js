import { Assets } from 'pixi.js';
import { sound } from '@pixi/sound';
import { SpriteSheetMeta } from '../assets/SpriteSheetMeta.js';
import { createFramesFromMeta } from './spriteFrames.js';

export class AssetLoader {
    static async loadAllAssets() {
        const assets = {};
        
        const walkTexture = await Assets.load('/assets/Walk_player.png');
        const walkMetaText = await fetch('/assets/Walk_player_meta.txt').then((response) => response.text());
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

        assets.playerWalk = walkTexture;
        assets.playerWalkFrames = createFramesFromMeta(walkTexture, walkMeta.sprites);
        assets.playerIdleFrame = assets.playerWalkFrames[0] ?? null;
        assets.zombieTexture = zombieTexture;
        assets.bastionBaseTexture = bastionBaseTexture;
        assets.turretSlotTexture = turretSlotTexture;
        assets.turretRadiusTexture = turretRadiusTexture;
        assets.machinegunBulletTexture = machinegunBulletTexture;
        assets.sniperBulletTexture = sniperBulletTexture;
        assets.cannonBulletTexture = areacannonBulletTexture;
        assets.healthBarBgTexture = healthBarBgTexture;
        assets.healthBarFillTexture = healthBarFillTexture;
        assets.coinTexture = coinTexture;
        assets.lifeTexture = lifeTexture;
        assets.explosionTexture = explosionTexture;
        assets.explosivePlantedTexture = explosivePlantedTexture;
        assets.placeC4Texture = placeC4Texture;
        assets.placeLandmineTexture = placeLandmineTexture;
        assets.placeTimebombTexture = placeTimebombTexture;
        
        if (!sound.exists('cannon_shoot')) sound.add('cannon_shoot', '/assets/sound/cannon_shoot.wav');
        if (!sound.exists('explosive_explode')) sound.add('explosive_explode', '/assets/sound/explosive_explode.wav');
        if (!sound.exists('machinegun_shot')) sound.add('machinegun_shot', '/assets/sound/machinegun_shot.wav');
        if (!sound.exists('sniper_shoot')) sound.add('sniper_shoot', '/assets/sound/sniper_shoot.wav');
        if (!sound.exists('survivor_shoot')) sound.add('survivor_shoot', '/assets/sound/survivor_shoot.wav');
        if (!sound.exists('zombie_attack')) sound.add('zombie_attack', '/assets/sound/zombie_attack.wav');
        if (!sound.exists('timebomb_beep')) sound.add('timebomb_beep', '/assets/sound/timebomb_beep.wav');
        assets.hudSpecTextures = {
            type: hudTypeTexture,
            fireRate: hudRateTexture,
            damage: hudDamageTexture,
            range: hudRangeTexture
        };
        assets.contextButtonTextures = {
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
        assets.turretSprites = {
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

        return assets;
    }
}
